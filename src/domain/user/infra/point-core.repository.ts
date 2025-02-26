import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import {
  EntityManager,
  OptimisticLockVersionMismatchError,
  Repository,
} from 'typeorm';

import { PointEntity, PointHistoryEntity } from '../domain';
import {
  FindLockOptions,
  PointRepository,
  UpdatePointParam,
} from './point.repository';
import { RunTimeException } from 'src/common';

@Injectable()
export class PointCoreRepository extends PointRepository {
  readonly pointHistoryRepo: Repository<PointHistoryEntity>;

  constructor(
    @InjectEntityManager()
    readonly manager: EntityManager,
  ) {
    super(PointEntity, manager);
    this.pointHistoryRepo = manager.getRepository(PointHistoryEntity);
  }

  override async getPointByPk(
    pointId: number,
    options: FindLockOptions = {},
  ): Promise<PointEntity> {
    const point = await this.findOne({
      where: { id: pointId },
      lock: { ...options.lock },
    });

    // Note: 로직상 point가 존재하지 않으면 데이터 자체의 오류이다.
    if (!point) throw new RunTimeException('포인트가 존재하지 않습니다.');
    return point;
  }

  override async updatePointWithHistory(
    pointId: number,
    param: UpdatePointParam,
  ): Promise<void> {
    const currentVersion = param.currentVersion;
    const updateVersion = currentVersion + 1;
    const result = await this.update(
      {
        id: pointId,
        version: currentVersion, // 버전 체크 조건
      },
      {
        amount: param.amount,
        version: updateVersion, // 버전 증가
      },
    );
    if (result.affected === 0) {
      throw new OptimisticLockVersionMismatchError(
        'PointEntity',
        updateVersion,
        currentVersion,
      );
    }

    await this.pointHistoryRepo.insert({ ...param });
  }
}
