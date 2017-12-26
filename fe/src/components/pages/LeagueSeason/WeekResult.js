import React from 'react';
import { fromJS, List, Map, Set } from 'immutable';
import { Table, Thead, Tbody, Row, Col } from '../../common/Table/Index';

import classnames from 'classnames/bind';
import style from './Index.css';
const cx = classnames.bind(style);

class WeekResult extends React.PureComponent {

    // constructor(props) {
    //     super(props);
    //     this.state = {
    //       selectWeek:1,
    //       data: []
    //     };
    //   }
  static defaultProps = {
    weeklyData: List(),
    data: List(),
    selectedWeek: () => {}
  };
  

//   selectedUserIndex(e){
//       this.setState({
//         selectWeek: e.target.value,
//         data: this.props.weeklyData[e.target.value]
//       });
//   }

  render() {
    const { props } = this;
    const { weeklyData, data, selectedWeek } = props;
    // console.log("from weeklydata", this.state.selectWeek, weeklyData, this.state.data);
    // this.setState({
    //     data: weeklyData[this.state.selectWeek],
    // });

    console.log("data--->", data);
    console.log("Weeklydata -->", weeklyData);
    return (

        <div>
        <select onChange={selectedWeek} className={cx('selector')}>
        {weeklyData.size > 1 &&
          weeklyData.map((d, i) => {
            return (
                i > 0 && 
              <option key={i} value={i}>
                {"Week:" + i}
              </option>
            );
          })}
      </select>
      <Table className={cx('week-result')}>
        <Thead>
          <Row>
            <Col>Weekly Result</Col>
          </Row>
          <Row>
            <Col className={cx('email')}>Team A</Col>
            <Col className={cx('score')}>Score A</Col>
            <Col className={cx('vs')}> vs </Col>
            <Col className={cx('score')}>Score B</Col>
            <Col className={cx('email')}>Team B</Col>
          </Row>
        </Thead>
        <Tbody>
          
        {data.size > 0 && data.map( (d, i) => {
            return (
              <Row key={d}>
                <Col className={cx('email')}> { d.get('first_team').get('email') } </Col>
                <Col className={cx('score')}>{ d.get('first_score') }</Col> 
                <Col className={cx('vs')}>{ "-" }</Col> 
                <Col className={cx('score')}>{ d.get('second_score') }</Col>
                <Col className={cx('email')}>{ d.getIn(['second_team','email']) }</Col>
              </Row>
            );
          })}
        </Tbody>
      </Table>
      </div>
    );
  }
}

export default WeekResult;
