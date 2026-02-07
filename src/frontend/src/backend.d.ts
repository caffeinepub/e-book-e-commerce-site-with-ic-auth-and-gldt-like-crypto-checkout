import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CustomerMessage {
    id: bigint;
    content: string;
    author: Principal;
    timestamp: Time;
    responseToMsgId?: bigint;
    isAdminResponse: boolean;
}
export type Time = bigint;
export interface Book {
    id: string;
    title: string;
    content?: string;
    author: string;
    available: boolean;
    price: bigint;
}
export interface CartItem {
    bookId: string;
    quantity: bigint;
}
export interface Order {
    user: Principal;
    orderId: string;
    totalAmount: bigint;
    timestamp: Time;
    items: Array<CartItem>;
    deliveredBookIds: Array<string>;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBook(id: string, title: string, author: string, price: bigint, content: string | null): Promise<void>;
    addToCart(bookId: string, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkout(orderId: string): Promise<void>;
    deleteBook(id: string): Promise<void>;
    getAllBooks(): Promise<Array<Book>>;
    getAllOrders(): Promise<Array<Order>>;
    getAvailableBooks(): Promise<Array<Book>>;
    getBalance(): Promise<bigint>;
    getBook(id: string): Promise<Book>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Array<CartItem>>;
    getDesignatedOwner(): Promise<Principal | null>;
    getMessageResponses(messageId: bigint): Promise<Array<CustomerMessage>>;
    getOrder(orderId: string): Promise<Order>;
    getPurchasedBookContent(orderId: string, bookId: string): Promise<string | null>;
    getUserMessages(includeResponses: boolean): Promise<Array<CustomerMessage>>;
    getUserOrders(user: Principal): Promise<Array<Order>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    mintTokens(to: Principal, amount: bigint): Promise<void>;
    recoverAdminAccess(): Promise<void>;
    removeFromCart(bookId: string): Promise<void>;
    resetStore(): Promise<void>;
    respondToMessage(originalMessageId: bigint, response: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendSupportMessage(content: string): Promise<bigint>;
    setDesignatedOwner(owner: Principal): Promise<void>;
    updateBook(id: string, title: string, author: string, price: bigint, available: boolean): Promise<void>;
    updateBookContent(id: string, content: string): Promise<void>;
}
