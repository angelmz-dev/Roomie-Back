// src/application/dtos/send-message.dto.ts
export interface SendChatMessageDTO {
    matchId: string;
    senderId: string; // Extraído del JWT en el Handshake de Socket.io
    content: string;
}