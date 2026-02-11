module {
  public func run(oldActor : { nextMessageId : Nat }) : { nextMessageId : Nat } {
    // Maintain nextMessageId for backward compatibility (remove if not needed)
    oldActor;
  };
};
