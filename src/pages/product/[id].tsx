import {
  ImageContainer,
  ProductContainer,
  ProductDetails,
} from "@/styles/pages/product";
import { GetServerSideProps, GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import { stripe } from "@/lib/stripe";
import { Stripe } from "stripe";
import { ParsedUrlQuery } from "querystring";
import Image from "next/image";
import axios from "axios";
import { useState } from "react";
import Head from "next/head";
interface ProductsProps {
  product: {
    id: string;
    name: string;
    imageUrl: string;
    price: string;
    description: string;
    defaultPriceId: string;
  };
}
export default function Product({ product }: ProductsProps) {
  const [isCreatingCheckoutSession, SetIsCreatingCheckoutSession] =
    useState(false);

  //const router = useRouter();

  async function handleBuyProduct() {
    try {
      SetIsCreatingCheckoutSession(true);
      const respose = await axios.post("/api/checkout", {
        priceId: product.defaultPriceId,
      });

      const { checkoutUrl } = respose.data;
      //router.push("/checkout"); rota interna
      window.location.href = checkoutUrl; // rota externa
    } catch (err) {
      SetIsCreatingCheckoutSession(false);
      console.log(err);
    }
  }
  const { query, isFallback } = useRouter();
  if (isFallback) {
    return <p>loading..</p>;
  }

  return (
    <>
      <Head>
        <title>{product.name}</title>
      </Head>
      <ProductContainer>
        <ImageContainer>
          <Image src={product.imageUrl} height={480} width={520} alt={""} />
        </ImageContainer>
        <ProductDetails>
          <h1>{product.name}</h1>
          <span>{product.price}</span>
          <p>{product.description}</p>
          <button
            disabled={isCreatingCheckoutSession}
            onClick={handleBuyProduct}
          >
            Comprar agora
          </button>
        </ProductDetails>
      </ProductContainer>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  //buscar os produtos mais vendidos
  return {
    paths: [{ params: { id: "prod_NfE4lTcDsvEtJq" } }],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const productId = String((params as ParsedUrlQuery).id);

  const product = await stripe.products.retrieve(productId, {
    expand: ["default_price"],
  });
  const price = product.default_price as Stripe.Price;
  if (price.unit_amount) {
    return {
      props: {
        product: {
          id: product.id,
          name: product.name,
          imageUrl: product.images[0],
          price: new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(price.unit_amount / 100),
          description: product.description,
          defaultPriceId: price.id,
        },
      },
    };
  }
  return {
    props: {
      product,
    },
    revalidate: 60 * 60 * 2, // 2 horas
  };
};
