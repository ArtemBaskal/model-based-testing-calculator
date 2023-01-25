import React from "react";
import { interpret } from "xstate";
import { machine } from "../../machine/machine";
import { scenario1Paths } from "../../machine/scenarios";
import { AppActor } from "../../AppActor";

const intermediatePaths = [
  ...scenario1Paths[0].segments.map((segment, i, segments) => {
    return segments.slice(0, i);
  }),
  scenario1Paths[0].segments,
];

const services = intermediatePaths.map((segments) => {
  const s = interpret(machine).start();

  segments.forEach((segment) => {
    s.send(segment.event);
  });

  return s;
});
export function States() {
  return (
    services.map((service, i) => {
      return <AppActor key={i} service={service}/>;
    })
  );
}
