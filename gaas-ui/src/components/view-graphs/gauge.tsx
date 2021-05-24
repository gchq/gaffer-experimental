
import React from "react";
import { RadialGauge, RadialGaugeArc, RadialGaugeSeries } from "reaviz";

export default function Gauge(props: { data: { key: string, data: number}[], colours: string[], maxValue: number }) {

    const {maxValue, data, colours } = props;

    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <RadialGauge
                height={165}
                width={400}
                minValue={0}
                maxValue={maxValue}
                data={data}
                series={
                    <RadialGaugeSeries
                        colorScheme={colours} 
                        arcWidth={11}
                        outerArc={ <RadialGaugeArc disabled={true} animated={false} /> }
                        innerArc={<RadialGaugeArc cornerRadius={5} />}
                    />
                }
            />
        </div>
    );
}
