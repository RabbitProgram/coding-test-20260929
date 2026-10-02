import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// globals を使わないので、テストごとの DOM の後片付けを明示する
afterEach(cleanup);
