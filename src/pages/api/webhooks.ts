import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from 'stream';
import Stripe from "stripe";
import { stripe } from "../../services/stripe";

async function buffer(readable: Readable) {
  const chunks = [];

  for await (const chunk of readable) {
    chunks.push(
      typeof chunk === 'string' ? Buffer.from(chunk) : chunk
    )
  }

  return Buffer.concat(chunks);
}

// Config API route, just export a config, and next will deal with it
// This is a config to read a stream
export const config = {
  api: {
    bodyParser: false
  }
}

const relevantEvents = new Set([
  'checkout.session.completed'
])

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const buf = await buffer(req);
    const secret = req.headers['stripe-signature'];

    let event: Stripe.Event;

    // Maneira que o stripe recomenda de verificarmos se o secret da aplicação (gerada pelo stripe cli) 
    // é o mesmo que estamos recebendo no header. E se der certo, agora temos várias informações
    // dentro do evento
    try {
      event = stripe.webhooks.constructEvent(buf, secret, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      return res.status(400).send(`Webhook error: ${err.message}`)
    }

    const { type } = event;

    if (relevantEvents.has(type)) {
      console.log('Evento recebido', event)
    }

    res.json({received: true})
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method now allowed')
  }
}