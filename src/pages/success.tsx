import { stripe } from "@/lib/stripe";
import { ImageContainer, SucessContainer } from "@/styles/pages/sucess";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Stripe from "stripe";

interface SucessProps {
  customerName: string;
  product: {
    name: string;
    imageUrl: string;
  };
}

export default function Success({ product, customerName }: SucessProps) {
  return (
    <>
      <Head>
        <title>Compra Efetuada | Ignite Shop</title>
        <meta name="robots" content="noindex" />
      </Head>
      <SucessContainer>
        <h1>Compra efetuada!</h1>
        <ImageContainer>
          <Image src={product.imageUrl} height={110} width={120} alt="" />
        </ImageContainer>
        <p>
          Uhlll <strong>{customerName}</strong>, sua{" "}
          <strong>{product.name}</strong> já está a caminho da sua casa
        </p>
        <Link href="/">Voltar ao catálogo</Link>
      </SucessContainer>
    </>
  );
}
export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  if (!query.session_id) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  const sessionId = String(query.session_id);

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items", "line_items.data.price.product"],
  });
  const customerName = session.customer_details?.name;
  const product = session.line_items?.data[0].price?.product as Stripe.Product;

  return {
    props: {
      customerName,
      product: {
        imageUrl: product.images[0],
        name: product.name,
      },
    },
  };
};
