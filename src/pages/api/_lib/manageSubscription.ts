import { query as q } from 'faunadb';
import { fauna } from "../../../services/fauna";
import { stripe } from '../../../services/stripe';

export async function saveSubscription(
  subscriptionId: string,
  customerId: string,
  createAction = false,
) {
  // Busca o usuário no fauna db com o customerId (stripe customer id)
  const userRef = await fauna.query(
    // Fazemos o select somente desse campo ref, para a cobrança ser menor
    q.Select(
      "ref",
      q.Get(
        q.Match(
          q.Index('user_by_stripe_customer_id'),
          customerId
        )
      )
    )
  )

  // Salva os dados da subscription no fauna db
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const subscriptionData = {
    id: subscription.id,
    userId: userRef,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
     
  }

  if (createAction) {
    await fauna.query(
      q.Create(
        q.Collection('subscriptions'),
        { data: subscriptionData }
      )
    )
  } else {
    // Aqui utilizamos o replace em vez do update porque dessa maneira, se mudarmos
    // os dados que temos no subscriptionData, nossa aplicação já estará pronta
    // para lidar com essa mudança sem alterações
    await fauna.query(
      q.Replace(
        q.Select(
          "ref",
          q.Get(
            q.Match(
              q.Index('subscription_by_id'),
              subscriptionId,
            )
          )
        ),
        {data: subscriptionData}
      )
    )
  }
  
}