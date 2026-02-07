import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Text "mo:core/Text";

module {
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

  type Actor = {
    bookStore : Map.Map<Text, Book>;
    cartStore : Map.Map<Principal, List.List<CartItem>>;
    orderStore : Map.Map<Text, Order>;
    balanceStore : Map.Map<Principal, Nat>;
    supportMessages : Map.Map<Nat, CustomerMessage>;
    // designatedOwner is new - no migration from old state needed
  };

  public func run(old : Actor) : Actor {
    old;
  };
};
