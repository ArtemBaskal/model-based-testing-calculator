import React from "react";
import { machine } from "../../machine/machine";
import { scenario1Paths, scenario1, getMeta } from "../../machine/scenarios";

export function Steps() {
  return (
    <>
      {scenario1Paths[0].segments.map((segment, i, segments) => {
        const { description } = getMeta(segment.state);
        const { transitions } = machine.transition(
          segment.state,
          segment.event,
        );

        debugger;
        const sameState = segments[i - 1] ? segment.state.matches(segments[i - 1].state.value) : false;
        const [transition] = transitions;

        return (
          <div key={i}>
            {!sameState && (
              <span>
                On the <strong>{description}</strong>,{" "}
              </span>
            )}
            <span>
              {sameState && <span>... and then </span>}
              {
                transition.meta?.description
                  ? <strong>{transition.meta.description}</strong>
                  : <>Execute event <strong>{transition.eventType}</strong></>
              }
              {
                transition.cond?.meta?.description
                  ? ` (${transition.cond?.meta?.description})`
                  : ""
              }
            </span>
          </div>
        );
      })}
      <div>
        Then you will reach{" "}
        <strong>{getMeta(scenario1.state).description}</strong>
      </div>
      <br />
    </>
  );
}
