import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import {
  SaveOutboxParam,
  SavePaymentParam,
  PaymentEntity,
  PaymentOutboxEntity,
  FindOutboxByOptions,
} from '../doamin';
import { PaymentRepository } from '../doamin';
import { RunTimeException } from 'src/common';

export class PaymentCoreRepository extends PaymentRepository {
  readonly outboxRepo: Repository<PaymentOutboxEntity>;

  constructor(
    @InjectEntityManager()
    readonly manager: EntityManager,
  ) {
    super(PaymentEntity, manager);
    this.outboxRepo = manager.getRepository(PaymentOutboxEntity);
  }

  override async savePayment(param: SavePaymentParam): Promise<PaymentEntity> {
    const payment = this.create(param);
    await this.save(payment);
    return payment;
  }

  override async saveOutbox(param: SaveOutboxParam): Promise<void> {
    const outbox = this.outboxRepo.create({
      ...param,
    });
    await this.outboxRepo.save(outbox);
  }

  override async getOutboxBy(
    options: FindOutboxByOptions,
  ): Promise<PaymentOutboxEntity> {
    const outbox = await this.outboxRepo.findOneBy(options);
    if (!outbox)
      throw new RunTimeException(
        '해당하는 payment outbox가 존재하지 않습니다.',
      );
    return outbox;
  }

  override async getOutboxes(
    options: FindOutboxByOptions,
  ): Promise<PaymentOutboxEntity[]> {
    return await this.outboxRepo.find({
      take: 100,
      order: { transactionId: 'ASC' },
      where: options,
    });
  }
}
