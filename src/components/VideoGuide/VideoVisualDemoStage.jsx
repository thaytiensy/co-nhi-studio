import React from 'react';
import { DemoScreenPart1, DemoScreenPart2 } from './demoScreens/DemoScreen12';
import { DemoScreenPart3, DemoScreenPart4 } from './demoScreens/DemoScreen34';
import { DemoScreenPart5, DemoScreenPart6 } from './demoScreens/DemoScreen56';

export default function VideoVisualDemoStage({ chapterId }) {
  switch (chapterId) {
    case 1:
      return <DemoScreenPart1 />;
    case 2:
      return <DemoScreenPart2 />;
    case 3:
      return <DemoScreenPart3 />;
    case 4:
      return <DemoScreenPart4 />;
    case 5:
      return <DemoScreenPart5 />;
    case 6:
      return <DemoScreenPart6 />;
    default:
      return <DemoScreenPart1 />;
  }
}
