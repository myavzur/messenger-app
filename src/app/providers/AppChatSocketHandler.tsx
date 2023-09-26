import React, { useEffect } from "react";

import { useSockets, useStoreDispatch, useStoreSelector } from "@/shared/lib/hooks";
import {
	addChat,
	addMessage,
	setActiveChat,
	setChats,
	updateChatCarefully
} from "@/shared/models/chats";

import { History } from "./AppRouter";

const TEMPORARY_CHAT = -1;

interface IAppChatSocketHandlerProps {
	children: React.ReactNode;
}

const AppChatSocketHandler: React.FC<IAppChatSocketHandlerProps> = ({
	children
}) => {
	const dispatch = useStoreDispatch();
	const { activeChat } = useStoreSelector(state => state.chats);
	const { chatSocket } = useSockets();

	useEffect(() => {
		if (!chatSocket) return;

		chatSocket.on("chats", data => {
			dispatch(setChats(data.chats));
		});

		chatSocket.on("chat", chat => {
			dispatch(setActiveChat(chat));

			// Don't request chat history of temporary chat, because it's null.
			if (chat.id === TEMPORARY_CHAT) return;

			chatSocket.emit("get-chat-history", {
				chatId: chat.id,
				page: 1,
				limit: 25
			});
		});

		chatSocket.on("chat-created", chat => {
			dispatch(addChat(chat));

			if (activeChat?.users[0].id === chat.users[0].id) {
				History.navigate(`/chats/${chat.id}`);
			}
		});

		chatSocket.on("new-message", data => {
			dispatch(
				addMessage({
					chatId: data.chat_id,
					message: data.message
				})
			);
		});

		chatSocket.on("chat-history", data => {
			dispatch(
				updateChatCarefully({
					chatId: data.chat_id,
					updatedData: {
						messages: data.messages
					}
				})
			);
		});
	}, []);

	return <React.Fragment>{children}</React.Fragment>;
};

export default AppChatSocketHandler;
