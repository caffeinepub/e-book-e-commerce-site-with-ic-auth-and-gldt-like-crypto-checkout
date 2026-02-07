import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
  type OldActor = {
    userProfiles : Map.Map<Principal, { name : Text }>;
    // Other fields (copied/adopted automatically)
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, { name : Text }>;
    // Other fields (copied/adopted automatically)
    nextMessageId : Nat;
    supportMessages : Map.Map<Nat, {
      id : Nat;
      author : Principal;
      content : Text;
      timestamp : Time.Time;
      isAdminResponse : Bool;
      responseToMsgId : ?Nat;
    }>;
  };

  public func run(old : OldActor) : NewActor {
    let supportMessages = Map.empty<Nat, {
      id : Nat;
      author : Principal;
      content : Text;
      timestamp : Time.Time;
      isAdminResponse : Bool;
      responseToMsgId : ?Nat;
    }>();
    {
      old with
      nextMessageId = 0;
      supportMessages;
    };
  };
};
