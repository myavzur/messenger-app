import React from "react";

import { AppRouter, AppStore, AppTheme } from "@/app/providers";
import "@/app/styles/index.scss";

import { SocketsContextProvider } from "@/shared/contexts/SocketsContextProvider";

const CHAT_SERVER_URL = import.meta.env.VITE_CHAT_SERVER_URL;
const PRESENCE_SERVER_URL = import.meta.env.VITE_PRESENCE_SERVER_URL;

function App() {
	return (
		<AppStore>
			<SocketsContextProvider
				chatServerUrl={CHAT_SERVER_URL}
				presenceServerUrl={PRESENCE_SERVER_URL}
			>
				<AppTheme>
					<AppRouter />
				</AppTheme>
			</SocketsContextProvider>
		</AppStore>
	);
}

export default App;
