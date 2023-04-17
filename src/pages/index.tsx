import { ArrowContainer, HomeContainer, Product } from "@/styles/pages/home";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

import { GetStaticProps } from "next";
import { stripe } from "@/lib/stripe";

import Stripe from "stripe";
import { useState } from "react";
import { ArrowCircleLeft, ArrowCircleRight } from "phosphor-react";

interface ProductsHome {
  products: {
    id: string;
    name: string;
    imageUrl: string;
    price: string;
  }[];
}

export default function Home({ products }: ProductsHome) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [sliderRef, instanceRef] = useKeenSlider({
    initial: 0,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
    created() {
      setLoaded(true);
    },
    slides: {
      perView: 3,
      spacing: 48,
    },
  });

  return (
    <>
      <Head>
        <title>Home | Ignite Shop</title>
      </Head>
      <HomeContainer ref={sliderRef} className="keen-slider">
        
        {products.map((product) => {
          return (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              prefetch={false}
            >
              <Product className="keen-slider__slide">
                <Image
                  src={product.imageUrl}
                  width={520}
                  height={480}
                  alt={""}
                  placeholder="blur"
                  blurDataURL={product.imageUrl}
                />
                <footer>
                  <strong>{product.name}</strong>
                  <span>{product.price}</span>
                </footer>
              </Product>
            </Link>
          );
        })}
      </HomeContainer>
      
      {loaded && instanceRef.current && (
        <ArrowContainer>
          <Arrow
            left
            onClick={(e: any) =>
              e.stopPropagation() || instanceRef.current?.prev()
            }
            disabled={currentSlide === 0}
          />

          <Arrow
            onClick={(e: any) =>
              e.stopPropagation() || instanceRef.current?.next()
            }
            disabled={
              currentSlide ===
              instanceRef.current.track.details.slides.length - 1
            }
          />
        </ArrowContainer>
      )}
    </>
  );
}

function Arrow(array: {
  disabled: boolean;
  left?: boolean;
  onClick: (e: any) => void;
}) {
  //const disabeld = props.disabled ? " arrow--disabled" : "";
  return (
    <>
      {array.left ? (
        <ArrowCircleLeft size={32} onClick={array.onClick} />
      ) : (
        <ArrowCircleRight size={32} onClick={array.onClick} />
      )}
    </>
  );
}
export const getStaticProps: GetStaticProps = async () => {
  const response = await stripe.products.list({
    expand: ["data.default_price"],
  });

  const products = response.data.map((product) => {
    const price = product.default_price as Stripe.Price;
    if (price.unit_amount) {
      return {
        id: product.id,
        name: product.name,
        imageUrl: product.images[0],
        price: new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(price.unit_amount / 100),
      };
    }
  });
  return {
    props: {
      products,
    },
    revalidate: 60 * 60 * 2, // 2 horas
  };
};
//getServerSideProps -> vai buscar os dados a cada f5 e busca dados para cada usuário, seu funcionamento é parecido como o useEffect, mas ele só carrega a página quando os dados já tiverem carregados

//GetStaticProps -> carrega os dados no cache, então reduz o carregamento, mas ele não tem carregamento dinâmico só estático.
