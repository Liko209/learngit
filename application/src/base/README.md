```tsx
import React from "react";
import { DataViewModel, buildContainer } from "./dataview";

type DemoViewProps = {
  id: number;
  text: string;
};

const DemoView = (props: DemoViewProps) => (
  <div>
    {props.id} - {props.text}
  </div>
);

class DemoViewModel extends DataViewModel<DemoViewProps> {
  async dataLoader(): Promise<DemoViewProps> {
    await sleep(3000);
    return {
      id: 1,
      text: "Hello World"
    };
  }
}

const DemoContainer = buildContainer({
  View: DemoView,
  ViewModel: DemoViewModel
});

class App extends React.PureComponent {
  public render() {
    return <DemoContainer />;
  }
}
```
