import { query as q } from 'faunadb';
import { fauna } from "../../../services/fauna";
import { stripe } from '../../../services/stripe';

export async function saveSubscription(
  subscriptionId: string,
  customerId: string,
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

  await fauna.query(
    q.Create(
      q.Collection('subscriptions'),
      { data: subscriptionData }
    )
  )
}