//경로 : C:\project\MuseReview\FE\src\utils\osmdCursor.ts
import type { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import type { CursorLike } from '@/types/osmd';

/**
 * OSMD 커서를 임의의 마디로 이동시킨다.
 * 뒤로 이동해야 하면 reset 후 다시 앞으로 진행한다(순방향 전제, seek-back은 드묾).
 *
 * 주의: iterator.CurrentMeasureIndex / EndReached 는 OSMD의 내부(공개) API이며
 * 설치된 OSMD 버전에 따라 이름이 다를 수 있다. 버전 업그레이드 시 확인 필요.
 */
export function moveCursorToMeasure(osmd: OpenSheetMusicDisplay, targetMeasureIndex: number) {
  const cursor = osmd.cursor as unknown as CursorLike;
  if (!cursor?.iterator) return;

  if (cursor.iterator.CurrentMeasureIndex > targetMeasureIndex) {
    cursor.reset();
  }

  let safety = 0;
  while (!cursor.iterator.EndReached && cursor.iterator.CurrentMeasureIndex < targetMeasureIndex && safety < 10000) {
    cursor.next();
    safety++;
  }
  cursor.update();
}
