import cn from "classnames";
import React from "react";

import { IReplyProps } from "./MessageEmbedded.interface";

import styles from "./MessageEmbedded.module.scss";

export const MessageEmbedded: React.FC<IReplyProps> = ({
	message,
	onClick,
	className
}) => {
	return (
		<div
			className={cn(styles.reply, className)}
			onClick={() => onClick(message)}
		>
			<p className={styles.reply__author}>{message.user.account_name}</p>
			<p className={styles.reply__text}>{message.text}</p>
		</div>
	);
};