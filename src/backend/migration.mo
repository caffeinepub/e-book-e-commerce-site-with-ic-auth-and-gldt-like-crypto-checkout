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
    media : MediaContent;
    singleCopy : Bool;
    kycRestricted : Bool;
  };
  type MediaContent = {
    pdf : ?Blob;
    images : [Blob];
    audio : [Blob];
    video : [Blob];
  };
  type CartItem = {
    bookId : Text;
    quantity : Nat;
  };
  type Order = {
    orderId : Text;
    user : Principal.Principal;
    items : [CartItem];
    totalAmount : Nat;
    timestamp : Time.Time;
    deliveredBookIds : [Text];
  };
  type OwnedBook = {
    bookId : Text;
    purchasedBy : Text;
  };
  type CustomerMessage = {
    id : Nat;
    author : Principal.Principal;
    content : Text;
    timestamp : Time.Time;
    isAdminResponse : Bool;
    responseToMsgId : ?Nat;
  };

  type ActorState = {
    userProfiles : Map.Map<Principal.Principal, { name : Text }>;
    bookStore : Map.Map<Text, Book>;
    cartStore : Map.Map<Principal.Principal, List.List<CartItem>>;
    orderStore : Map.Map<Text, Order>;
    balanceStore : Map.Map<Principal.Principal, Nat>;
    ownedBooks : Map.Map<Text, OwnedBook>;
    nextMessageId : Nat;
    supportMessages : Map.Map<Nat, CustomerMessage>;
    designatedOwner : ?Principal.Principal;
    kycIdToPrincipal : Map.Map<Text, Principal.Principal>;
    principalToKycId : Map.Map<Principal.Principal, Text>;
    purchasesByCustomerId : Map.Map<Text, List.List<Text>>;
    permanentlyBlacklisted : Map.Map<Text, ()>;
    validationTimestamps : Map.Map<Text, Time.Time>;
  };

  public func run(actorState : ActorState) : ActorState {
    actorState;
  };
};
