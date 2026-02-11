import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface CustomerMessage {
    id: bigint;
    content: string;
    author: Principal;
    timestamp: Time;
    responseToMsgId?: bigint;
    isAdminResponse: boolean;
}
export type Time = bigint;
export interface ReEnableBooksResult {
    updatedBooks: Array<string>;
    skippedBooks: Array<string>;
    updatedCount: bigint;
}
export interface Book {
    id: string;
    media: MediaContent;
    title: string;
    content?: string;
    author: string;
    available: boolean;
    kycRestricted: boolean;
    singleCopy: boolean;
    price: bigint;
}
export interface Order {
    user: Principal;
    orderId: string;
    totalAmount: bigint;
    timestamp: Time;
    items: Array<CartItem>;
    deliveredBookIds: Array<string>;
}
export interface OwnedBook {
    bookId: string;
    purchasedBy: string;
}
export interface CatalogState {
    purchasesByCustomerId: Array<[string, Array<string>]>;
    balanceStore: Array<[Principal, bigint]>;
    cartStore: Array<[Principal, Array<CartItem>]>;
    nextMessageId: bigint;
    principalToKycId: Array<[Principal, string]>;
    supportMessages: Array<[bigint, CustomerMessage]>;
    bookStore: Array<[string, Book]>;
    permanentlyBlacklisted: Array<[string, null]>;
    userProfiles: Array<[Principal, UserProfile]>;
    ownedBooks: Array<[string, OwnedBook]>;
    orderStore: Array<[string, Order]>;
    kycRestrictedPurchases: Array<[string, string]>;
    designatedOwner?: Principal;
    kycIdToPrincipal: Array<[string, Principal]>;
    validationTimestamps: Array<[string, Time]>;
}
export interface CartItem {
    bookId: string;
    quantity: bigint;
}
export interface MediaContent {
    pdf?: ExternalBlob;
    audio: Array<ExternalBlob>;
    video: Array<ExternalBlob>;
    images: Array<ExternalBlob>;
}
export interface UserProfile {
    name: string;
}
export enum KYcState {
    awaitingProof = "awaitingProof",
    validatedProof = "validatedProof",
    permanentlyBlacklisted = "permanentlyBlacklisted",
    rejected = "rejected",
    notRequired = "notRequired"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBook(id: string, title: string, author: string, price: bigint, content: string | null, singleCopy: boolean, kycRestricted: boolean): Promise<void>;
    addToCart(bookId: string, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    blacklistKyc(kycId: string): Promise<KYcState>;
    checkout(orderId: string, kycIdentifier: string, kycProofValid: boolean): Promise<[string, Order | null]>;
    deleteBook(id: string): Promise<void>;
    exportCatalog(): Promise<CatalogState>;
    fetchPurchasedBookMedia(orderId: string, bookId: string): Promise<MediaContent>;
    getAllBooks(): Promise<Array<Book>>;
    getAllOrders(): Promise<Array<Order>>;
    getAvailableBooks(): Promise<Array<Book>>;
    getBalance(): Promise<bigint>;
    getBook(id: string): Promise<Book>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Array<CartItem>>;
    getDesignatedOwner(): Promise<Principal | null>;
    getKycProof(kycId: string): Promise<KYcState>;
    getMessageResponses(messageId: bigint): Promise<Array<CustomerMessage>>;
    getOrder(orderId: string): Promise<Order>;
    getPurchasedBookContent(orderId: string, bookId: string): Promise<string | null>;
    getUserMessages(includeResponses: boolean): Promise<Array<CustomerMessage>>;
    getUserOrders(user: Principal): Promise<Array<Order>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    importCatalog(newCatalog: CatalogState): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    mintTokens(to: Principal, amount: bigint): Promise<void>;
    reEnableBooksByIdentifier(identifier: string): Promise<ReEnableBooksResult>;
    recoverAdminAccess(): Promise<void>;
    rejectKycProof(kycId: string): Promise<KYcState>;
    removeBookAudio(bookId: string, audioIndex: bigint): Promise<void>;
    removeBookImage(bookId: string, imageIndex: bigint): Promise<void>;
    removeBookPdf(bookId: string): Promise<void>;
    removeBookVideo(bookId: string, videoIndex: bigint): Promise<void>;
    removeFromCart(bookId: string): Promise<void>;
    resetStore(): Promise<void>;
    respondToMessage(originalMessageId: bigint, response: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendSupportMessage(content: string): Promise<bigint>;
    setDesignatedOwner(owner: Principal): Promise<void>;
    submitKycProof(kycIdentifier: string, kycProofValid: boolean): Promise<string>;
    updateBook(id: string, title: string, author: string, price: bigint, available: boolean, singleCopy: boolean, kycRestricted: boolean): Promise<void>;
    updateBookContent(id: string, content: string): Promise<void>;
    uploadBookAudio(bookId: string, audioBlob: ExternalBlob): Promise<void>;
    uploadBookImage(bookId: string, imageBlob: ExternalBlob): Promise<void>;
    uploadBookPdf(bookId: string, pdfBlob: ExternalBlob): Promise<void>;
    uploadBookVideo(bookId: string, videoBlob: ExternalBlob): Promise<void>;
}
