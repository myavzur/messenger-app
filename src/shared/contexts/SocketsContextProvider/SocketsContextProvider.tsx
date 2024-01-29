import React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { io } from "socket.io-client";

import { History } from "@/app/providers/AppRouter";

import { ChatType } from "@/entities/chat/interfaces";

import { getAccessToken, getSocketOptions } from "@/shared/lib/helpers";
import { chatActions } from "@/shared/models/chats";

import { SocketsContext } from "./SocketsContext";
import { ISocketsContext } from "./SocketsContext.interface";
import { ISocketsContextProviderProps } from "./SocketsContextProvider.interface";

export const SocketsContextProvider: React.FC<ISocketsContextProviderProps> = ({
	chatServerUrl,
	presenceServerUrl,
	children
}) => {
	const dispatch = useDispatch();

	const [accessToken, setAccessToken] = useState(getAccessToken());
	const socketRefs = useRef<ISocketsContext["sockets"]>([]);

	// Presence Socket
	const presenceSocket = useMemo<ISocketsContext["presenceSocket"]>(() => {
		if (accessToken) {
			const socket = io(presenceServerUrl, getSocketOptions(accessToken));

			socket.on("new-status-in-local-chat", data => {
				dispatch(chatActions.updateLocalChatPresence(data));
			});

			socketRefs.current.push({ name: "presence", socket });
			return socket;
		}

		console.log("Create connection Presence: No token.");
		return null;

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [presenceServerUrl, accessToken]);

	// Chat Socket
	const chatSocket = useMemo<ISocketsContext["chatSocket"]>(() => {
		if (accessToken) {
			const socket = io(chatServerUrl, getSocketOptions(accessToken));

			socket.on("chats", data => {
				dispatch(chatActions.setChats(data.chats));
			});
			socket.on("chat", chat => {
				dispatch(chatActions.setCurrentChat(chat));

				// Don't request chat history of temporary chat, because it's doesn't exist.
				if (chat.type === ChatType.TEMP) return;

				socket.emit("get-chat-history", {
					chatId: chat.id,
					page: 1,
					limit: 25
				});
			});
			socket.on("chat-created", chat => {
				dispatch(chatActions.addChat(chat));
				History.navigate(`/chats/${chat.id}`);
			});
			socket.on("new-message", data => {
				dispatch(
					chatActions.addMessage({
						chatId: data.chat_id,
						message: data.message
					})
				);
			});
			socket.on("chat-history", data => {
				dispatch(
					chatActions.updateChatCarefully({
						chatId: data.chat_id,
						newData: {
							messages: data.messages
						}
					})
				);
			});

			socketRefs.current.push({ name: "chat", socket });
			return socket;
		}

		console.log("Create connection Chat: No token.");
		return null;

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [chatServerUrl, accessToken]);

	console.log("RENDER SOCKETS Provider");

	// * Sockets Connection.
	useEffect(() => {
		socketRefs.current.forEach(({ name, socket }) => {
			socket.on("connect", () => {
				console.log(
					`[SocketsContextProvider] Connected to ${name} Service via WS. 💹`
				);
			});
			socket.on("disconnect", () => {
				console.log(
					`[SocketsContextProvider] Disconnected from ${name} Service. 🔻`
				);

				// * Delete socket from socketRefs if server disconnected him (on server).
				socketRefs.current = socketRefs.current.filter(
					socket => socket.name !== name
				);
			});
		});

		return () => {
			socketRefs.current.forEach(({ socket }) => {
				socket.disconnect();
			});
		};
	}, []);

	// * Methods
	const disconnectAll = useCallback(() => {
		socketRefs.current.forEach(({ name, socket }) => {
			console.log(`Disconnecting ${name} Socket. 🔁`);

			// * Delete socket from socketRefs if socket disconnected on client.
			socketRefs.current = socketRefs.current.filter(socket => socket.name !== name);
			socket.disconnect();
		});
	}, []);

	/** Once method is called, it will create new instances of sockets with new credentials. */
	const updateSocketsAccessToken = useCallback((accessToken: string) => {
		console.log("[SocketsContextProvider] Updating access token. 🔁");
		setAccessToken(accessToken);
	}, []);

	return (
		<SocketsContext.Provider
			value={{
				presenceSocket: presenceSocket,
				chatSocket: chatSocket,
				sockets: socketRefs.current,
				updateSocketsAccessToken,
				disconnectAll
			}}
		>
			{children}
		</SocketsContext.Provider>
	);
};
