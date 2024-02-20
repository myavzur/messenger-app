import cn from "classnames";
import React from "react";

import { formatUpdatedDate, serializeChat } from "@/entities/chat/lib/helpers";

import { Avatar } from "@/shared/ui";

import { ChatType } from "../../interfaces";
import { ChatLastMessage } from "../ChatLastMessage";

import { IChatCardProps } from "./ChatCard.interface";

import styles from "./ChatCard.module.scss";

export const ChatCard: React.FC<IChatCardProps> = ({
	currentUserId,
	chat,
	onClick,
	isSelected
}) => {
	const serializedChat = serializeChat({ currentUserId, chat });

	return (
		<div
			className={cn(styles.card, { [styles.card_selected]: isSelected })}
			onClick={() => onClick?.(chat)}
		>
			<Avatar
				className={styles.card__image}
				status={serializedChat?.user_status}
				src={serializedChat.image_url}
				alt={undefined}
			>
				{serializedChat.title || "???"}
			</Avatar>

			<div className={styles.card__info}>
				<div className={styles.card__top}>
					<p className={styles["card__top-title"]}>{serializedChat.title}</p>
					{serializedChat.last_message && (
						<p className={styles["card__top-updated"]}>
							{formatUpdatedDate(serializedChat.last_message.created_at)}
						</p>
					)}
					<p
						className={`p-1 text-xs ${
							chat.type === ChatType.GROUP
								? "bg-blue-500"
								: chat.type === ChatType.LOCAL
								? "bg-green-600"
								: "bg-red-500"
						} rounded-md text-white`}
					>
						{chat.type.toUpperCase()}
					</p>
				</div>

				<div className={styles.card__bottom}>
					<ChatLastMessage
						isSelected={isSelected}
						chat={serializedChat}
						currentUserId={currentUserId}
					/>
				</div>
			</div>
		</div>
	);
};
