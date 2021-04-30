import Prismic from '@prismicio/client';

// Recomendação do prismic : cada vez que formos mexer com os dados, a doc recomenda
// sempre usar um cliente novo quando for comunicar com um prismic
// Também sempre passarmos a requisição para o client
export function getPrismicClient(req?: unknown) {
  const prismic = Prismic.client(
    process.env.PRISMIC_ENDPOINT,
    {
      req,
      accessToken: process.env.PRISMIC_ACCESS_TOKEN
    }
  )

  return prismic;
}