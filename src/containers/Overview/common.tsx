import dynamic from 'next/dynamic'
import * as React from 'react'
import { IJSON } from '~/api/categories/adaptors/types'
import { BreakpointPanel, BreakpointPanels, ChartAndValuesWrapper, PanelHiddenMobile } from '~/components'
import { IBarChartProps } from '~/components/ECharts/types'
import { formattedNum } from '~/utils'
import { IDexChartsProps } from './OverviewItem'

const StackedBarChart = dynamic(() => import('~/components/ECharts/BarChart'), {
	ssr: false
}) as React.FC<IBarChartProps>

export interface IMainBarChartProps {
	type: string
	total24h: number | null
	change_1d: number | null
	change_1m: number | null
	chartData: IBarChartProps['chartData'] | null
}
export const MainBarChart: React.FC<IDexChartsProps> = (props) => {
	const dataType =
		props.type === 'dexs' || props.type === 'options' || props.type === 'aggregators' ? 'volume' : props.type
	const simpleStack =
		props.chartData[1].includes('Fees') || props.chartData[1].includes('Premium volume')
			? props.chartData[1].reduce((acc, curr) => ({ ...acc, [curr]: curr }), {})
			: undefined

	const chartData = React.useMemo(() => {
		return props.chartData
			? Object.entries(
					props.chartData[0].reduce((acc, curr) => {
						Object.keys(curr).forEach((key) => {
							const value = curr[key]
							if (key === 'date' || typeof value === 'string') return
							if (acc[key]) acc[key].push([new Date(+curr.date * 1000), value])
							else acc[key] = [[new Date(+curr.date * 1000), value]]
						})
						return acc
					}, {} as IJSON<IBarChartProps['chartData'][number]['data']>)
			  ).map(([name, data]) => ({ name, data }))
			: []
	}, [props.chartData])

	return (
		<ChartAndValuesWrapper>
			{props.data.total24h || props.data.change_1d || props.data.change_1m ? (
				<BreakpointPanels>
					{!Number.isNaN(props.data.total24h) && (
						<BreakpointPanel>
							<h1>Total {dataType} (24h)</h1>
							<p style={{ '--tile-text-color': '#4f8fea' } as React.CSSProperties}>
								{formattedNum(props.data.total24h, true)}
							</p>
						</BreakpointPanel>
					)}
					{!Number.isNaN(props.data.change_1d) && (
						<PanelHiddenMobile>
							<h2>Change (24h)</h2>
							{props.data.change_1d > 0 ? (
								<p style={{ '--tile-text-color': '#3cfd99' } as React.CSSProperties}> {props.data.change_1d || 0}%</p>
							) : (
								<p style={{ '--tile-text-color': '#fd3c99' } as React.CSSProperties}> {props.data.change_1d || 0}%</p>
							)}
						</PanelHiddenMobile>
					)}
					{!Number.isNaN(props.data.change_1m) && (
						<PanelHiddenMobile>
							<h2>Change (30d)</h2>
							<p style={{ '--tile-text-color': '#46acb7' } as React.CSSProperties}> {props.data.change_1m || 0}%</p>
						</PanelHiddenMobile>
					)}
				</BreakpointPanels>
			) : (
				<></>
			)}
			<BreakpointPanel id="chartWrapper">
				{chartData && chartData.length > 0 && (
					<StackedBarChart
						title=""
						chartData={props.chartData[0]}
						customLegendOptions={props.chartData[1] as string[]}
						stacks={simpleStack}
						/* stackColors={stackedBarChartColors} */
					/>
				)}
			</BreakpointPanel>
		</ChartAndValuesWrapper>
	)
}
