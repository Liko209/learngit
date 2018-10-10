# Jupiter Application Architecture

## Store

## Container

Containers are self maintain components. They accept entity id, load entities using given id, and display it using child container or `jui`

We organized container code using `MVVM` pattern. For each container, we have 5 files:

1. View
2. ViewModel
3. Container
4. types
5. index

See `application/src/containers/demo` for more details.

### View

A view receives props from ViewModel, and display it using child container or `jui`.

```tsx
import React from "react";
import { MyViewProps } from "./types";

const MyView = (props: MyViewProps) => (
  <div>
    <p>{props.text}</p>
  </div>
);

export { MyView };
```

### ViewModel

A view model maintains data for display. In most common case, view model receives a entity id from parent component and fetch data from store using the entity's id.

```ts
import { action, computed, observable } from "mobx";
import { AbstractViewModel } from "@/base";
import { getEntity } from "@/store/utils";
import { MyProps, MyViewProps } from "./types";

class MyViewModel extends AbstractViewModel implements MyViewProps {
  @observable
  myId: number;

  @computed
  private get _myEntity() {
    return getEntity(ENTITY_NAME.MY, this.myId) as MyModel;
  }

  @computed
  get text() {
    return this._myEntity.text;
  }

  onReceiveProps(props: MyProps) {
    if (this.myId !== props.myId) {
      this.myId = props.myId;
    }
  }
}

export { MyViewModel };
```

## Container

Containers are built from `View` and `ViewModel`, it is very simple.

```ts
import { buildContainer } from "@/base";
import { MyView } from "./My.View";
import { MyViewModel } from "./My.ViewModel";
import { MyProps } from "./types";

const My = buildContainer<MyProps>({
  ViewModel: MyViewModel,
  View: MyView
});

export { My, MyProps };
```
