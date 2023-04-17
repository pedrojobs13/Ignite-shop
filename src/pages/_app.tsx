import { globalStyles } from "@/styles/global";
import type { AppProps } from "next/app";

import logoImg from "../assets/logo.svg";
import { Container, Header } from "@/styles/pages/app";
import Image from "next/image";


export default function App({ Component, pageProps }: AppProps) {
  globalStyles();
  return (
    <Container>
      <Header>
        <Image src={logoImg.src} width={100} height={100} alt="" />
      </Header>
      <Component {...pageProps} />
    </Container>
  );
}
