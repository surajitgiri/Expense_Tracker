"use client"

import { useEffect, useState } from "react"
import {PieChart , Pie  , Sector ,Tooltip , Legend ,  ResponsiveContainer  } from "recharts"

type CategoryData = {
  name: string
  color: string
  icon: string
  amount: number
}
type Props = {
    data: CategoryData[]
}
export default function SpendingPieChart({data}: Props){

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize" , check);
    return () => window.removeEventListener("resize" , check)
  },[])

  if(data.length === 0){
    return  <p className="text-sm text-gray-400 text-center py-10">No expense data</p>
  }
  return(
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
        data={data.map((item) => ({
          ...item,
          fill : item.color
        }
        ))}
        dataKey="amount"
        nameKey="name"
        cx="50%"
        cy="50%"
        innerRadius={50}
        outerRadius={80}
        paddingAngle={3}
        label={isMobile?false:({name , percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
        labelLine={false}

        shape={(props:any) => {
            const {
              cx, cy,
              innerRadious , outerRadius,
              startAngle , endAngle,
              index,
            } = props
            return (
              <Sector
               cx={cx}
               cy={cy}
               innerRadius={innerRadious}
               outerRadius={outerRadius}
               startAngle={startAngle}
               endAngle={endAngle}
               fill={data[index]?.color || "#8884d8"}
              />
            )
        }}
        />
          <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`}/>
            <Legend
              verticalAlign="bottom"
              align="center"
              layout="horizontal"
              wrapperStyle={{
                fontSize: "12px",
                paddingTop: "10px"
              }}
              formatter={(value , entry) => (
                 <span style={{color: entry.color}} className="text-xs font-medium">{value}</span>
              )}
            />
      </PieChart>
    </ResponsiveContainer>
  )
}