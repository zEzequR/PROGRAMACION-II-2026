import { Kafka } from 'kafkajs';
import 'dotenv/config';

export const kafka = new Kafka({
  clientId: 'localiapp-shop',
  brokers: [process.env.KAFKA_BROKER],
})