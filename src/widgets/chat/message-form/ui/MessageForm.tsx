import React, { useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import { AttachmentLoader } from "@/features/chat/attachment-loader/ui/AttachmentLoader.tsx";
import { FieldAttachAction } from "@/features/chat/field-attach-action/ui";

import { IAttachment } from "@/entities/attachment/interfaces/attachment.interface.ts";
import { ChatMessageEmbedded } from "@/entities/chat/ui";

import {
	useAttachmentsContext,
	useAuth,
	useSocketsContext,
	useStoreDispatch,
	useStoreSelector
} from "@/shared/lib/hooks";
import { chatActions } from "@/shared/models/chats/chats.slice.ts";
import { Icon, TextAreaField } from "@/shared/ui";

import { IMessageFormProps } from "./MessageForm.interface.ts";

import styles from "./MessageForm.module.scss";

export const MessageForm: React.FC<IMessageFormProps> = ({ className }) => {
	const dispatch = useStoreDispatch();
	const { currentUser } = useAuth();
	const { chatSocket } = useSocketsContext();
	const { attachments, clearAttachments } = useAttachmentsContext();

	const currentChat = useStoreSelector(state => state.chats.currentChat.data);
	const embeddedMessage = useStoreSelector(
		state => state.chats.currentChat.embeddedMessage
	);

	const attachmentIdsRef = useRef<IAttachment["id"][]>([]);
	const [isSendLoading, setSendLoading] = useState(false);

	const {
		register,
		handleSubmit,
		reset,
		formState: { isValid }
	} = useForm<{ text: string }>({ mode: "onChange" });

	const clearEmbeddedMessage = () => {
		dispatch(chatActions.clearCurrentChatEmbeddedMessage());
	};

	const handleAttachmentLoaded = (data: any) => {
		attachmentIdsRef.current = [...attachmentIdsRef.current, data.attachment_id];
	};

	const handleSendMessage: SubmitHandler<{ text: string }> = message => {
		if (!chatSocket?.connected || !currentUser || !currentChat) return;
		if (!isValid) return;
		if (isSendLoading) return;

		// Changing isSendLoading before reset to prevent placeholder flicks.
		setSendLoading(true);
		reset();
		clearEmbeddedMessage();

		chatSocket?.emit(
			"send-message",
			{
				chatId: currentChat.id,
				userId: currentChat.participants.find(
					participant => participant.user.id !== currentUser.id
				)?.user.id,
				text: message.text,
				replyForId: embeddedMessage?.id,
				attachmentIds: attachmentIdsRef.current
			},
			() => {
				console.log("%c[MessageForm/send-message]: Success.", "color: green");
				attachmentIdsRef.current = [];
				clearAttachments();
				setSendLoading(false);
			}
		);

		reset();
	};

	return (
		<div className={className}>
			{embeddedMessage && (
				<div className={styles.embedded}>
					<Icon
						name="reply"
						className={styles.embedded__icon}
					/>

					<ChatMessageEmbedded
						className={styles.embedded__message}
						message={embeddedMessage}
						onClick={() => alert("Embeded!")}
					/>

					<Icon
						name="close"
						className={styles.embedded__close}
						onClick={clearEmbeddedMessage}
					/>
				</div>
			)}

			<form className={styles.form}>
				<TextAreaField
					placeholder={isSendLoading ? "Sending message..." : "Message"}
					{...register("text", {
						minLength: 1,
						required: true
					})}
					maxGrowHeight={420}
					preventBorderTop={Boolean(embeddedMessage)}
					onEnterKeyPress={handleSubmit(handleSendMessage)}
				>
					<FieldAttachAction sex={true} />
				</TextAreaField>
			</form>

			{attachments.length > 0 && (
				<div className={styles.attachments}>
					{attachments.map((file, idx) => {
						return (
							<AttachmentLoader
								key={idx}
								file={file}
								url="/upload/m-attachment?tag=media"
								onLoadEnded={handleAttachmentLoaded}
							/>
						);
					})}
				</div>
			)}
		</div>
	);
};