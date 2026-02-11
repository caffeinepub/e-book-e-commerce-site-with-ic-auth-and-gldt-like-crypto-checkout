// NO CHANGES
import Map "mo:core/Map";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Storage "blob-storage/Storage";
import Runtime "mo:core/Runtime";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  type MediaContent = {
    pdf : ?Storage.ExternalBlob;
    images : [Storage.ExternalBlob];
    audio : [Storage.ExternalBlob];
    video : [Storage.ExternalBlob];
  };

  type Book = {
    id : Text;
    title : Text;
    author : Text;
    price : Nat;
    available : Bool;
    content : ?Text;
    media : MediaContent;
    singleCopy : Bool;
    kycRestricted : Bool;
  };

  type OwnedBook = {
    bookId : Text;
    purchasedBy : Text;
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
  let ownedBooks = Map.empty<Text, OwnedBook>();

  var nextMessageId = 0;
  let supportMessages = Map.empty<Nat, CustomerMessage>();

  var designatedOwner : ?Principal = null;

  let kycIdToPrincipal = Map.empty<Text, Principal>();
  let principalToKycId = Map.empty<Principal, Text>();
  let purchasesByCustomerId = Map.empty<Text, List.List<Text>>();
  let permanentlyBlacklisted = Map.empty<Text, ()>();
  let validationTimestamps = Map.empty<Text, Time.Time>();
  let kycRestrictedPurchases = Map.empty<Text, Text>();

  public type KYcState = {
    #notRequired;
    #awaitingProof;
    #validatedProof;
    #rejected;
    #permanentlyBlacklisted;
  };

  module Book {
    public func compareByTitle(b1 : Book, b2 : Book) : Order.Order {
      switch (Text.compare(b1.title, b2.title)) {
        case (#equal) { Text.compare(b1.author, b2.author) };
        case (order) { order };
      };
    };
  };

  public type CatalogState = {
    userProfiles : [(Principal, UserProfile)];
    bookStore : [(Text, Book)];
    cartStore : [(Principal, [CartItem])];
    orderStore : [(Text, Order)];
    balanceStore : [(Principal, Nat)];
    ownedBooks : [(Text, OwnedBook)];
    nextMessageId : Nat;
    supportMessages : [(Nat, CustomerMessage)];
    designatedOwner : ?Principal;
    kycIdToPrincipal : [(Text, Principal)];
    principalToKycId : [(Principal, Text)];
    purchasesByCustomerId : [(Text, [Text])];
    permanentlyBlacklisted : [(Text, ())];
    validationTimestamps : [(Text, Time.Time)];
    kycRestrictedPurchases : [(Text, Text)];
  };
  public shared ({ caller }) func exportCatalog() : async CatalogState {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can export catalog");
    };

    let catalog : CatalogState = {
      userProfiles = userProfiles.entries().toArray();
      bookStore = bookStore.entries().toArray();
      cartStore = cartStore.entries().map(
        func((principal, list)) {
          (principal, list.toArray());
        }
      ).toArray();
      orderStore = orderStore.entries().toArray();
      balanceStore = balanceStore.entries().toArray();
      ownedBooks = ownedBooks.entries().toArray();
      nextMessageId = nextMessageId;
      supportMessages = supportMessages.entries().toArray();
      designatedOwner = designatedOwner;
      kycIdToPrincipal = kycIdToPrincipal.entries().toArray();
      principalToKycId = principalToKycId.entries().toArray();
      purchasesByCustomerId = purchasesByCustomerId.entries().map(
        func((kycId, list)) {
          (kycId, list.toArray());
        }
      ).toArray();
      permanentlyBlacklisted = permanentlyBlacklisted.entries().toArray();
      validationTimestamps = validationTimestamps.entries().toArray();
      kycRestrictedPurchases = kycRestrictedPurchases.entries().toArray();
    };

    catalog;
  };

  public shared ({ caller }) func importCatalog(newCatalog : CatalogState) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can import catalog");
    };

    userProfiles.clear();
    bookStore.clear();
    cartStore.clear();
    orderStore.clear();
    balanceStore.clear();
    ownedBooks.clear();
    supportMessages.clear();
    kycIdToPrincipal.clear();
    principalToKycId.clear();
    purchasesByCustomerId.clear();
    permanentlyBlacklisted.clear();
    validationTimestamps.clear();
    kycRestrictedPurchases.clear();

    for ((principal, profile) in newCatalog.userProfiles.values()) {
      userProfiles.add(principal, profile);
    };

    for ((bookId, book) in newCatalog.bookStore.values()) {
      bookStore.add(bookId, book);
    };

    for ((principal, items) in newCatalog.cartStore.values()) {
      let list = List.fromArray<CartItem>(items);
      cartStore.add(principal, list);
    };

    for ((orderId, order) in newCatalog.orderStore.values()) {
      orderStore.add(orderId, order);
    };

    for ((principal, balance) in newCatalog.balanceStore.values()) {
      balanceStore.add(principal, balance);
    };

    for ((bookId, ownedBook) in newCatalog.ownedBooks.values()) {
      ownedBooks.add(bookId, ownedBook);
    };

    nextMessageId := newCatalog.nextMessageId;

    for ((msgId, message) in newCatalog.supportMessages.values()) {
      supportMessages.add(msgId, message);
    };

    designatedOwner := newCatalog.designatedOwner;

    for ((kycId, principal) in newCatalog.kycIdToPrincipal.values()) {
      kycIdToPrincipal.add(kycId, principal);
    };

    for ((principal, kycId) in newCatalog.principalToKycId.values()) {
      principalToKycId.add(principal, kycId);
    };

    for ((kycId, purchases) in newCatalog.purchasesByCustomerId.values()) {
      let list = List.fromArray(purchases);
      purchasesByCustomerId.add(kycId, list);
    };

    for ((kycId, unit) in newCatalog.permanentlyBlacklisted.values()) {
      permanentlyBlacklisted.add(kycId, unit);
    };

    for ((kycId, timestamp) in newCatalog.validationTimestamps.values()) {
      validationTimestamps.add(kycId, timestamp);
    };

    for ((kycId, bookId) in newCatalog.kycRestrictedPurchases.values()) {
      kycRestrictedPurchases.add(kycId, bookId);
    };
  };

  public shared ({ caller }) func setDesignatedOwner(owner : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can set designated owner");
    };
    if (owner.isAnonymous()) {
      Runtime.trap("Cannot set anonymous principal as designated owner");
    };
    designatedOwner := ?owner;
  };

  public query ({ caller }) func getDesignatedOwner() : async ?Principal {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view designated owner");
    };
    designatedOwner;
  };

  public shared ({ caller }) func recoverAdminAccess() : async () {
    switch (designatedOwner) {
      case (null) {
        Runtime.trap("No designated owner set - recovery not available");
      };
      case (?owner) {
        if (caller != owner) {
          Runtime.trap("Unauthorized: Only the designated owner can recover admin access");
        };
        AccessControl.assignRole(accessControlState, caller, caller, #admin);
      };
    };
  };

  public shared ({ caller }) func sendSupportMessage(content : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send support messages");
    };

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

  public query ({ caller }) func getUserMessages(includeResponses : Bool) : async [CustomerMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };

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

  public query ({ caller }) func getMessageResponses(messageId : Nat) : async [CustomerMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view message responses");
    };

    switch (supportMessages.get(messageId)) {
      case (null) { Runtime.trap("Message not found") };
      case (?originalMsg) {
        if (originalMsg.author != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only can view responses to your own messages");
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

  public query ({ caller }) func getBook(id : Text) : async Book {
    switch (bookStore.get(id)) {
      case (null) { Runtime.trap("Book not found") };
      case (?book) {
        // Return book with content stripped for non-purchasers
        if (not hasAccessToBook(caller, id)) {
          return {
            book with
            content = null;
          };
        };
        book;
      };
    };
  };

  public query ({ caller }) func getAllBooks() : async [Book] {
    let books = bookStore.values().toArray().sort(Book.compareByTitle);
    // Strip content from books user hasn't purchased
    books.map(func(book) {
      if (not hasAccessToBook(caller, book.id)) {
        return {
          book with
          content = null;
        };
      };
      book;
    });
  };

  public query ({ caller }) func getAvailableBooks() : async [Book] {
    let availableBooksIter = bookStore.values().filter(
      func(book) { book.available }
    );
    let books = availableBooksIter.toArray().sort(Book.compareByTitle);
    // Strip content from books user hasn't purchased
    books.map(func(book) {
      if (not hasAccessToBook(caller, book.id)) {
        return {
          book with
          content = null;
        };
      };
      book;
    });
  };

  public shared ({ caller }) func addBook(
    id : Text,
    title : Text,
    author : Text,
    price : Nat,
    content : ?Text,
    singleCopy : Bool,
    kycRestricted : Bool,
  ) : async () {
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
      media = {
        pdf = null;
        images = [];
        audio = [];
        video = [];
      };
      singleCopy;
      kycRestricted;
    };
    bookStore.add(id, book);
  };

  public shared ({ caller }) func updateBook(
    id : Text,
    title : Text,
    author : Text,
    price : Nat,
    available : Bool,
    singleCopy : Bool,
    kycRestricted : Bool,
  ) : async () {
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
          media = existingBook.media;
          singleCopy;
          kycRestricted;
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
          media = existingBook.media;
          singleCopy = existingBook.singleCopy;
          kycRestricted = existingBook.kycRestricted;
        };
        bookStore.add(id, updatedBook);
      };
    };
  };

  public shared ({ caller }) func uploadBookPdf(bookId : Text, pdfBlob : Storage.ExternalBlob) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can upload PDFs");
    };
    switch (bookStore.get(bookId)) {
      case (null) { Runtime.trap("Book not found") };
      case (?book) {
        var newMedia = { book.media with pdf = ?pdfBlob };
        let updatedBook : Book = { book with media = newMedia };
        bookStore.add(bookId, updatedBook);
      };
    };
  };

  public shared ({ caller }) func removeBookPdf(bookId : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can remove PDFs");
    };
    switch (bookStore.get(bookId)) {
      case (null) { Runtime.trap("Book not found") };
      case (?book) {
        var newMedia = { book.media with pdf = null };
        let updatedBook : Book = { book with media = newMedia };
        bookStore.add(bookId, updatedBook);
      };
    };
  };

  public shared ({ caller }) func uploadBookImage(bookId : Text, imageBlob : Storage.ExternalBlob) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can upload images");
    };
    switch (bookStore.get(bookId)) {
      case (null) { Runtime.trap("Book not found") };
      case (?book) {
        let newMedia = { book.media with images = book.media.images.concat([imageBlob]) };
        let updatedBook : Book = { book with media = newMedia };
        bookStore.add(bookId, updatedBook);
      };
    };
  };

  public shared ({ caller }) func removeBookImage(bookId : Text, imageIndex : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can remove images");
    };
    switch (bookStore.get(bookId)) {
      case (null) { Runtime.trap("Book not found") };
      case (?book) {
        let images = book.media.images;
        if (imageIndex >= images.size()) {
          Runtime.trap("Image index out of bounds");
        };
        let newImages = images.sliceToArray(0, imageIndex).concat(
          images.sliceToArray(imageIndex + 1, images.size())
        );
        let newMedia = { book.media with images = newImages };
        let updatedBook : Book = { book with media = newMedia };
        bookStore.add(bookId, updatedBook);
      };
    };
  };

  public shared ({ caller }) func uploadBookAudio(bookId : Text, audioBlob : Storage.ExternalBlob) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can upload audio");
    };
    switch (bookStore.get(bookId)) {
      case (null) { Runtime.trap("Book not found") };
      case (?book) {
        let newMedia = { book.media with audio = book.media.audio.concat([audioBlob]) };
        let updatedBook : Book = { book with media = newMedia };
        bookStore.add(bookId, updatedBook);
      };
    };
  };

  public shared ({ caller }) func removeBookAudio(bookId : Text, audioIndex : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can remove audio");
    };
    switch (bookStore.get(bookId)) {
      case (null) { Runtime.trap("Book not found") };
      case (?book) {
        let audio = book.media.audio;
        if (audioIndex >= audio.size()) {
          Runtime.trap("Audio index out of bounds");
        };
        let newAudio = audio.sliceToArray(0, audioIndex).concat(
          audio.sliceToArray(audioIndex + 1, audio.size())
        );
        let newMedia = { book.media with audio = newAudio };
        let updatedBook : Book = { book with media = newMedia };
        bookStore.add(bookId, updatedBook);
      };
    };
  };

  public shared ({ caller }) func uploadBookVideo(bookId : Text, videoBlob : Storage.ExternalBlob) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can upload video");
    };
    switch (bookStore.get(bookId)) {
      case (null) { Runtime.trap("Book not found") };
      case (?book) {
        let newMedia = { book.media with video = book.media.video.concat([videoBlob]) };
        let updatedBook : Book = { book with media = newMedia };
        bookStore.add(bookId, updatedBook);
      };
    };
  };

  public shared ({ caller }) func removeBookVideo(bookId : Text, videoIndex : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can remove video");
    };
    switch (bookStore.get(bookId)) {
      case (null) { Runtime.trap("Book not found") };
      case (?book) {
        let video = book.media.video;
        if (videoIndex >= video.size()) {
          Runtime.trap("Video index out of bounds");
        };
        let newVideo = video.sliceToArray(0, videoIndex).concat(
          video.sliceToArray(videoIndex + 1, video.size())
        );
        let newMedia = { book.media with video = newVideo };
        let updatedBook : Book = { book with media = newMedia };
        bookStore.add(bookId, updatedBook);
      };
    };
  };

  func hasPurchasedBook(user : Principal, bookId : Text) : Bool {
    for (order in orderStore.values()) {
      if (order.user == user) {
        for (item in order.items.values()) {
          if (item.bookId == bookId) { return true };
        };
      };
    };
    false;
  };

  func hasAccessToBook(user : Principal, bookId : Text) : Bool {
    if (AccessControl.hasPermission(accessControlState, user, #admin)) {
      return true;
    };
    return hasPurchasedBook(user, bookId);
  };

  func hasOrderAccess(caller : Principal, orderId : Text) : Bool {
    switch (orderStore.get(orderId)) {
      case (null) { false };
      case (?order) {
        order.user == caller or AccessControl.hasPermission(accessControlState, caller, #admin)
      };
    };
  };

  public query ({ caller }) func fetchPurchasedBookMedia(
    orderId : Text,
    bookId : Text,
  ) : async MediaContent {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access media");
    };

    if (not hasOrderAccess(caller, orderId)) {
      Runtime.trap("Unauthorized: Only the order owner or admins can access media");
    };

    switch (orderStore.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let bookPurchased = order.items.any(
          func(item) { item.bookId == bookId }
        );
        if (not bookPurchased) {
          Runtime.trap("Book not included in order");
        };

        switch (bookStore.get(bookId)) {
          case (null) { Runtime.trap("Book not found") };
          case (?book) { return book.media };
        };
      };
    };
  };

  public shared ({ caller }) func deleteBook(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete books");
    };
    bookStore.remove(id);
  };

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

        if (book.kycRestricted) {
          switch (principalToKycId.get(caller)) {
            case (null) {
              Runtime.trap("KYC verification required for this book. Please complete KYC verification before purchasing.");
            };
            case (?kycId) {
              if (permanentlyBlacklisted.containsKey(kycId)) {
                Runtime.trap("Your account has been blacklisted and cannot make purchases");
              };
              if (not validationTimestamps.containsKey(kycId)) {
                Runtime.trap("KYC verification expired or not validated. Please complete KYC verification.");
              };
              if (kycRestrictedPurchases.containsKey(kycId)) {
                Runtime.trap("You have already purchased a KYC-restricted book and cannot purchase additional KYC-restricted books");
              };
            };
          };
        };

        if (book.singleCopy and ownedBooks.containsKey(bookId)) {
          Runtime.trap("This book is sold out (single copy only)");
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

  public shared ({ caller }) func submitKycProof(kycIdentifier : Text, kycProofValid : Bool) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit KYC proof");
    };

    let kycIdTrimmed = kycIdentifier.trim(#char(' '));

    if (kycIdTrimmed.size() <= 4) {
      return "The entered ID is not valid! A valid KYC ID must contain at least 5 characters.";
    };

    if (permanentlyBlacklisted.containsKey(kycIdTrimmed)) {
      return "KYC verification failed: This identity has been permanently blacklisted";
    };

    switch (kycIdToPrincipal.get(kycIdTrimmed)) {
      case (?existingPrincipal) {
        if (existingPrincipal != caller) {
          return "KYC verification failed: This identity is already associated with another account";
        };
      };
      case (null) {};
    };

    if (not kycProofValid) {
      return "KYC verification failed: Invalid or expired proof provided";
    };

    kycIdToPrincipal.add(kycIdTrimmed, caller);
    principalToKycId.add(caller, kycIdTrimmed);
    validationTimestamps.add(kycIdTrimmed, Time.now());

    "KYC verification successful";
  };

  public shared ({ caller }) func checkout(
    orderId : Text,
    kycIdentifier : Text,
    kycProofValid : Bool,
  ) : async (Text, ?Order) {
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

    var hasKycRestrictedBooks = false;
    for (item in cart.values()) {
      switch (bookStore.get(item.bookId)) {
        case (?book) {
          if (book.kycRestricted) {
            hasKycRestrictedBooks := true;
          };
        };
        case (null) {};
      };
    };

    let kycIdTrimmed = kycIdentifier.trim(#char(' '));

    if (hasKycRestrictedBooks) {
      if (permanentlyBlacklisted.containsKey(kycIdTrimmed)) {
        return ("KYC verification failed: This identity has been permanently blacklisted", null);
      };

      switch (kycIdToPrincipal.get(kycIdTrimmed)) {
        case (?existingPrincipal) {
          if (existingPrincipal != caller) {
            return ("KYC verification failed: This identity is already associated with another account", null);
          };
        };
        case (null) {};
      };

      if (not kycProofValid) {
        return ("KYC verification failed: Invalid or expired proof provided", null);
      };

      if (not validationTimestamps.containsKey(kycIdTrimmed)) {
        kycIdToPrincipal.add(kycIdTrimmed, caller);
        principalToKycId.add(caller, kycIdTrimmed);
        validationTimestamps.add(kycIdTrimmed, Time.now());
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

    let purchasedBooks = cart.toArray().map(
      func(item) {
        switch (bookStore.get(item.bookId)) {
          case (null) { Runtime.trap("Book not found: " # item.bookId) };
          case (?book) {
            if (book.kycRestricted) {
              if (kycRestrictedPurchases.containsKey(kycIdTrimmed)) {
                Runtime.trap("You have already purchased a KYC-restricted book and cannot purchase additional KYC-restricted books");
              };
            };

            if (book.singleCopy and ownedBooks.containsKey(item.bookId)) {
              Runtime.trap("This book is sold out (single copy only)");
            };

            let newOwnedBook : OwnedBook = {
              bookId = item.bookId;
              purchasedBy = kycIdTrimmed;
            };

            ownedBooks.add(item.bookId, newOwnedBook);

            item.bookId;
          };
        };
      }
    );

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

    if (hasKycRestrictedBooks and purchasedBooks.size() > 0) {
      kycRestrictedPurchases.add(kycIdTrimmed, purchasedBooks[0]);
    };

    let purchasedCount = purchasedBooks.size();
    let purchaseMsg = if (hasKycRestrictedBooks) {
      if (purchasedCount == 1) {
        "Book purchase successful for KYC verified customer with ID " # kycIdTrimmed # ". " #
        purchasedCount.toText() # " book purchased. Order ID: " # orderId;
      } else {
        "Book purchase successful for KYC verified customer with ID " # kycIdTrimmed # ". " #
        purchasedCount.toText() # " books purchased. Order ID: " # orderId;
      };
    } else {
      if (purchasedCount == 1) {
        "Book purchase successful. " # purchasedCount.toText() # " book purchased. Order ID: " # orderId;
      } else {
        "Book purchase successful. " # purchasedCount.toText() # " books purchased. Order ID: " # orderId;
      };
    };
    (purchaseMsg, ?order);
  };

  public query ({ caller }) func getKycProof(kycId : Text) : async KYcState {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check KYC status");
    };

    let kycIdTrimmed = kycId.trim(#char(' '));

    // Check if caller owns this KYC ID or is admin
    let isOwner = switch (principalToKycId.get(caller)) {
      case (?callerKycId) { callerKycId == kycIdTrimmed };
      case (null) { false };
    };

    if (not isOwner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only check your own KYC status");
    };

    if (permanentlyBlacklisted.containsKey(kycIdTrimmed)) {
      return #permanentlyBlacklisted;
    };

    switch (validationTimestamps.get(kycIdTrimmed)) {
      case (null) { #awaitingProof };
      case (?_) { #validatedProof };
    };
  };

  public shared ({ caller }) func rejectKycProof(kycId : Text) : async KYcState {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can reject KYC proof");
    };
    let kycIdTrimmed = kycId.trim(#char(' '));
    validationTimestamps.remove(kycIdTrimmed);
    #rejected;
  };

  public shared ({ caller }) func blacklistKyc(kycId : Text) : async KYcState {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can blacklist KYC identities");
    };
    let kycIdTrimmed = kycId.trim(#char(' '));
    permanentlyBlacklisted.add(kycIdTrimmed, ());
    validationTimestamps.remove(kycIdTrimmed);
    #permanentlyBlacklisted;
  };

  public query ({ caller }) func getOrder(orderId : Text) : async Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

    if (user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only user or admins can access orders");
    };

    let userOrdersIter = orderStore.values().filter(
      func(order) { order.user == user }
    );
    userOrdersIter.toArray();
  };

  public query ({ caller }) func getPurchasedBookContent(orderId : Text, bookId : Text) : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access book content");
    };

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
    kycIdToPrincipal.clear();
    principalToKycId.clear();
    purchasesByCustomerId.clear();
    permanentlyBlacklisted.clear();
    validationTimestamps.clear();
    kycRestrictedPurchases.clear();
  };
};
