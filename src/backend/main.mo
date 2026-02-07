import Map "mo:core/Map";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Array "mo:core/Array";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

// specify the data migration function in with-clause
(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  type Book = {
    id : Text;
    title : Text;
    author : Text;
    price : Nat;
    available : Bool;
    content : ?Text;
  };

  type CartItem = {
    bookId : Text;
    quantity : Nat;
  };

  type Order = {
    orderId : Text;
    user : Principal;
    items : [CartItem];
    totalAmount : Nat;
    timestamp : Time.Time;
    deliveredBookIds : [Text];
  };

  type CustomerMessage = {
    id : Nat;
    author : Principal;
    content : Text;
    timestamp : Time.Time;
    isAdminResponse : Bool;
    responseToMsgId : ?Nat;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let bookStore = Map.empty<Text, Book>();
  let cartStore = Map.empty<Principal, List.List<CartItem>>();
  let orderStore = Map.empty<Text, Order>();
  let balanceStore = Map.empty<Principal, Nat>();

  var nextMessageId = 0;
  let supportMessages = Map.empty<Nat, CustomerMessage>();

  // Owner recovery state - stores the designated owner principal
  var designatedOwner : ?Principal = null;

  module Book {
    public func compareByTitle(b1 : Book, b2 : Book) : Order.Order {
      switch (Text.compare(b1.title, b2.title)) {
        case (#equal) { Text.compare(b1.author, b2.author) };
        case (order) { order };
      };
    };
  };

  // Owner Recovery Functions
  // Admin-only: Set the designated owner who can recover admin access
  public shared ({ caller }) func setDesignatedOwner(owner : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can set designated owner");
    };
    if (owner.isAnonymous()) {
      Runtime.trap("Cannot set anonymous principal as designated owner");
    };
    designatedOwner := ?owner;
  };

  // Query the designated owner (admin-only for security)
  public query ({ caller }) func getDesignatedOwner() : async ?Principal {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view designated owner");
    };
    designatedOwner;
  };

  // Recovery function: Allows designated owner to reclaim admin access
  public shared ({ caller }) func recoverAdminAccess() : async () {
    switch (designatedOwner) {
      case (null) {
        Runtime.trap("No designated owner set - recovery not available");
      };
      case (?owner) {
        if (caller != owner) {
          Runtime.trap("Unauthorized: Only the designated owner can recover admin access");
        };
        // Grant admin role to the designated owner
        // Note: assignRole already includes admin-only guard, but we bypass it here
        // by directly calling it as the recovery mechanism
        AccessControl.assignRole(accessControlState, caller, caller, #admin);
      };
    };
  };

  // Customer Service Chat Functions
  // Any user including guests can submit questions
  public shared ({ caller }) func sendSupportMessage(content : Text) : async Nat {
    if (content.size() < 10) {
      Runtime.trap("Message must contain at least 10 characters (counting spaces)");
    };

    let messageId = nextMessageId;
    nextMessageId += 1;

    let message : CustomerMessage = {
      id = messageId;
      author = caller;
      content;
      timestamp = Time.now();
      isAdminResponse = false;
      responseToMsgId = null;
    };

    supportMessages.add(messageId, message);
    messageId;
  };

  // Only admins can reply to messages
  public shared ({ caller }) func respondToMessage(originalMessageId : Nat, response : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can respond to messages");
    };

    switch (supportMessages.get(originalMessageId)) {
      case (null) { Runtime.trap("Original message not found") };
      case (_) {
        let responseMsg : CustomerMessage = {
          id = nextMessageId;
          author = caller;
          content = response;
          timestamp = Time.now();
          isAdminResponse = true;
          responseToMsgId = ?originalMessageId;
        };

        supportMessages.add(nextMessageId, responseMsg);
        nextMessageId += 1;
      };
    };
  };

  // Users can view replies to their own messages
  public query ({ caller }) func getUserMessages(includeResponses : Bool) : async [CustomerMessage] {
    let messages = supportMessages.values().filter(
      func(msg) { msg.author == caller }
    );

    if (includeResponses) {
      return messages.toArray();
    };

    let filteredMessages = messages.filter(
      func(msg) { not msg.isAdminResponse }
    );
    filteredMessages.toArray();
  };

  // Users can view responses to their own messages
  public query ({ caller }) func getMessageResponses(messageId : Nat) : async [CustomerMessage] {
    // First verify that the caller owns the original message or is an admin
    switch (supportMessages.get(messageId)) {
      case (null) { Runtime.trap("Message not found") };
      case (?originalMsg) {
        if (originalMsg.author != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view responses to your own messages");
        };
      };
    };

    supportMessages.values().filter(
      func(msg) {
        switch (msg.responseToMsgId) {
          case (?origId) { origId == messageId };
          case (null) { false };
        };
      }
    ).toArray();
  };

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Book Catalog Functions (Public - accessible to all including guests)
  public query ({ caller }) func getBook(id : Text) : async Book {
    switch (bookStore.get(id)) {
      case (null) { Runtime.trap("Book not found") };
      case (?book) { book };
    };
  };

  public query ({ caller }) func getAllBooks() : async [Book] {
    bookStore.values().toArray().sort(Book.compareByTitle);
  };

  public query ({ caller }) func getAvailableBooks() : async [Book] {
    let availableBooksIter = bookStore.values().filter(
      func(book) { book.available }
    );
    availableBooksIter.toArray().sort(Book.compareByTitle);
  };

  // Admin-only Book Management Functions
  public shared ({ caller }) func addBook(id : Text, title : Text, author : Text, price : Nat, content : ?Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add books");
    };
    if (bookStore.containsKey(id)) {
      Runtime.trap("Book ID already exists");
    };
    let book : Book = {
      id;
      title;
      author;
      price;
      available = true;
      content;
    };
    bookStore.add(id, book);
  };

  public shared ({ caller }) func updateBook(id : Text, title : Text, author : Text, price : Nat, available : Bool) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update books");
    };

    switch (bookStore.get(id)) {
      case (null) { Runtime.trap("Book not found") };
      case (?existingBook) {
        let updatedBook : Book = {
          id;
          title;
          author;
          price;
          available;
          content = existingBook.content;
        };
        bookStore.add(id, updatedBook);
      };
    };
  };

  public shared ({ caller }) func updateBookContent(id : Text, content : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update book content");
    };

    switch (bookStore.get(id)) {
      case (null) { Runtime.trap("Book not found") };
      case (?existingBook) {
        let updatedBook : Book = {
          id = existingBook.id;
          title = existingBook.title;
          author = existingBook.author;
          price = existingBook.price;
          available = existingBook.available;
          content = ?content;
        };
        bookStore.add(id, updatedBook);
      };
    };
  };

  public shared ({ caller }) func deleteBook(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete books");
    };
    bookStore.remove(id);
  };

  // Token Ledger Functions
  public shared ({ caller }) func mintTokens(to : Principal, amount : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can mint tokens");
    };
    let currentBalance = switch (balanceStore.get(to)) {
      case (null) { 0 };
      case (?balance) { balance };
    };
    balanceStore.add(to, currentBalance + amount);
  };

  public query ({ caller }) func getBalance() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check balance");
    };
    let balance = switch (balanceStore.get(caller)) {
      case (null) { 0 };
      case (?b) { b };
    };
    balance;
  };

  // Cart Functions (User-only)
  public shared ({ caller }) func addToCart(bookId : Text, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add to cart");
    };

    if (quantity == 0) {
      Runtime.trap("Quantity must be greater than 0");
    };

    let cart = switch (cartStore.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?items) { items };
    };

    switch (bookStore.get(bookId)) {
      case (null) { Runtime.trap("Book not found") };
      case (?book) {
        if (not book.available) {
          Runtime.trap("Book is not available");
        };

        let newItem : CartItem = { bookId; quantity };
        cart.add(newItem);
        cartStore.add(caller, cart);
      };
    };
  };

  public shared ({ caller }) func removeFromCart(bookId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove from cart");
    };

    let cart = switch (cartStore.get(caller)) {
      case (null) { Runtime.trap("Cart is empty") };
      case (?items) { items };
    };

    let filteredCart = cart.filter(
      func(item) { item.bookId != bookId }
    );

    if (filteredCart.isEmpty()) {
      cartStore.remove(caller);
    } else {
      cartStore.add(caller, filteredCart);
    };
  };

  public query ({ caller }) func getCart() : async [CartItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cart");
    };

    switch (cartStore.get(caller)) {
      case (null) { [] };
      case (?items) { items.toArray() };
    };
  };

  // Checkout Function (User-only)
  public shared ({ caller }) func checkout(orderId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can checkout");
    };

    if (orderStore.containsKey(orderId)) {
      Runtime.trap("Order ID already exists");
    };

    let cart = switch (cartStore.get(caller)) {
      case (null) { Runtime.trap("Cart is empty") };
      case (?items) {
        if (items.size() == 0) {
          Runtime.trap("Cart is empty");
        };
        items;
      };
    };

    var totalAmount = 0;

    for (item in cart.values()) {
      switch (bookStore.get(item.bookId)) {
        case (null) { Runtime.trap("Book not found: " # item.bookId) };
        case (?book) {
          if (book.price == 0) {
            Runtime.trap("Invalid book price");
          };
          totalAmount += book.price * item.quantity;
        };
      };
    };

    if (totalAmount == 0) {
      Runtime.trap("Invalid total amount");
    };

    let currentBalance = switch (balanceStore.get(caller)) {
      case (null) { 0 };
      case (?balance) { balance };
    };

    if (currentBalance < totalAmount) {
      Runtime.trap("Insufficient balance");
    };

    balanceStore.add(caller, currentBalance - totalAmount);

    let deliveredBookIds = cart.toArray().map(
      func(item) { item.bookId }
    );

    let order : Order = {
      orderId;
      user = caller;
      items = cart.toArray();
      totalAmount;
      timestamp = Time.now();
      deliveredBookIds;
    };

    orderStore.add(orderId, order);
    cartStore.remove(caller);
  };

  // Order Functions
  public query ({ caller }) func getOrder(orderId : Text) : async Order {
    switch (orderStore.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        if (order.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only order owner or admins can access order");
        };
        order;
      };
    };
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orderStore.values().toArray();
  };

  public query ({ caller }) func getUserOrders(user : Principal) : async [Order] {
    if (user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only user or admins can access orders");
    };

    let userOrdersIter = orderStore.values().filter(
      func(order) { order.user == user }
    );
    userOrdersIter.toArray();
  };

  // Digital Delivery Function
  public query ({ caller }) func getPurchasedBookContent(orderId : Text, bookId : Text) : async ?Text {
    switch (orderStore.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        if (order.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only order owner or admins can access content");
        };

        for (deliveredBookId in order.deliveredBookIds.values()) {
          if (deliveredBookId == bookId) {
            switch (bookStore.get(bookId)) {
              case (null) { Runtime.trap("Book not found") };
              case (?book) { return book.content };
            };
          };
        };

        Runtime.trap("Book ID not found in order");
      };
    };
  };

  // Admin-only Reset Function
  public shared ({ caller }) func resetStore() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can reset store");
    };
    bookStore.clear();
    cartStore.clear();
    orderStore.clear();
    balanceStore.clear();
    supportMessages.clear();
    nextMessageId := 0;
  };
};
