import {
  Controller,
  Inject,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ClientKafka, MessagePattern, Payload } from '@nestjs/microservices';

import { KAFKA_CLIENT_NAME } from 'src/common';
import { ConsumRequestReservation } from './dto';
import { ApiExcludeController } from '@nestjs/swagger';
import { ReservationFacade } from '../../application';
import { CustomLoggerService } from 'src/global';

@ApiExcludeController()
@Controller()
export class ReservationConsumer implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject(KAFKA_CLIENT_NAME)
    private readonly kafkaClient: ClientKafka,
    private readonly reservationFacade: ReservationFacade,
    private readonly logger: CustomLoggerService,
  ) {
    this.logger.setTarget(this.constructor.name);
  }

  async onModuleInit(): Promise<void> {
    // const topics = ['payment.pay.topic'];
    // topics.forEach((topic) => this.kafkaClient.subscribeToResponseOf(topic));
    await this.kafkaClient.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.kafkaClient.close();
  }

  /**
      { 
        key: 'payment_pay_topic_15',
        value: '{"id":10,"userId":1,"reservationId":17,"payPrice":100000,"seatId":17}'
      }
  */
  @MessagePattern('payment.pay.topic')
  async handlePayPayment(@Payload() data: ConsumRequestReservation) {
    this.logger.debug(`handlePayPayment: ${data}`);
    const outbox = JSON.parse(data.value);
    await this.reservationFacade.confirm(outbox.reservationId);
  }
}
