import { Message, Type, Field, OneOf } from "protobufjs/light"; // respectively "./node_modules/protobufjs/light.js"

@Type.d()
export class HelloSignet extends Message<HelloSignet> {
  @Field.d(1, "string", "optional", "awesome default string")
  public name: string;

  @Field.d(2, "string", "optional", "awesome default string")
  public url: string;
}

export const testFixture = () => {
  return {
    js: {
      name: "Grumpy Cat",
      url: "https://media.giphy.com/media/5LU6ZcEGBbhVS/giphy.mp4",
    },
    buffer:
      "0a0a4772756d707920436174123568747470733a2f2f6d656469612e67697068792e636f6d2f6d656469612f354c55365a63454742626856532f67697068792e6d7034",
  };
};
