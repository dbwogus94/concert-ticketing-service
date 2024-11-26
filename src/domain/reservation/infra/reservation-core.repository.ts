import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { ResourceNotFoundException, RunTimeException } from 'src/common';
import {
  FindByOptions,
  FindOutboxByOptions,
  ReservationEntity,
  ReservationOutboxEntity,
  ReservationRepository,
  ReservationStatus,
  SaveOutboxParam,
  SaveReservationParam,
} from '../doamin';

@Injectable()
export class ReservationCoreRepository extends ReservationRepository {
  readonly outboxRepo: Repository<ReservationOutboxEntity>;

  constructor(
    @InjectEntityManager()
    readonly manager: EntityManager,
  ) {
    super(ReservationEntity, manager);
    this.outboxRepo = manager.getRepository(ReservationOutboxEntity);
  }

  override async findReservationBy(
    options: FindByOptions,
  ): Promise<ReservationEntity> {
    return await this.findOneBy({ ...options });
  }

  override async getReservationBy(
    options: FindByOptions = {},
  ): Promise<ReservationEntity> {
    const reservation = await this.findOneBy({
      ...options,
    });
    if (!reservation)
      throw new ResourceNotFoundException('예약이 존재하지 않습니다.');
    return reservation;
  }

  override async saveReservation(
    param: SaveReservationParam,
  ): Promise<ReservationEntity> {
    const reservation = this.create(param);
    await this.save(reservation);
    return reservation;
  }

  override async updateReservationStatus(
    reservationId: number,
    status: ReservationStatus,
  ): Promise<void> {
    await this.update(reservationId, { status });
  }

  override async saveOutbox(param: SaveOutboxParam): Promise<void> {
    const outbox = this.outboxRepo.create({
      ...param,
    });
    await this.outboxRepo.save(outbox);
  }

  override async getOutboxBy(
    options: FindOutboxByOptions,
  ): Promise<ReservationOutboxEntity> {
    const outbox = await this.outboxRepo.findOneBy(options);
    if (!outbox)
      throw new RunTimeException(
        '해당하는 reservation outbox가 존재하지 않습니다.',
      );
    return outbox;
  }

  override async getOutboxes(
    options: FindOutboxByOptions,
  ): Promise<ReservationOutboxEntity[]> {
    return await this.outboxRepo.find({
      take: 100,
      order: { transactionId: 'ASC' },
      where: options,
    });
  }
}
