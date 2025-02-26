import { applyDecorators } from '@nestjs/common';
import { OnEvent, OnEventType } from '@nestjs/event-emitter';
import { OnEventOptions } from '@nestjs/event-emitter/dist/interfaces';

import { BaseEventListener } from '../base-event-listener';

function _OnSyncCustomEventHandler(): MethodDecorator {
  return function (
    target: any,
    key: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    const parent = target.constructor.prototype;
    if (!(parent instanceof BaseEventListener)) {
      throw new Error(
        `❌ @OnCustomEvent can only be used on classes that extend ${BaseEventListener}.`,
      );
    }

    const metaKeys = Reflect.getOwnMetadataKeys(descriptor.value);
    const metas = metaKeys.map((key) => [
      key,
      Reflect.getMetadata(key, descriptor.value),
    ]);

    // method proxy
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      await originalMethod.call(this, ...args);
    };

    metas.forEach(([k, v]) => Reflect.defineMetadata(k, v, descriptor.value));
  };
}

/**
 * @nestjs/event-emitter의 에러를 핸들링 하기 위한 MethodDecorator를 생성합니다.
 * - `@nestjs/event-emitter#OnEvent`를 내부적으로 사용합니다.
 * - 내부적으로 { async: false, suppressErrors: false }를 고정해 사용
 * - 위 옵션은 이벤트를 동기로 동작시키고 처리중 에러가 발생시 emit을 호출한 로직으로 에러를 전파하게 한다.
 * @param event
 * @param options `Omit<OnEventOptions, 'async' | 'suppressErrors'>`
 * @returns
 */
export function OnSyncEvent(
  event: OnEventType,
  options: Omit<OnEventOptions, 'async' | 'suppressErrors'> = void 0,
) {
  // 동기로 동작 그리고 에러를 emit을 호출한 코드로 전파한다.
  const syncOptions = { async: false, suppressErrors: false };
  return applyDecorators(
    OnEvent(event, { ...options, ...syncOptions }),
    _OnSyncCustomEventHandler(),
  );
}
