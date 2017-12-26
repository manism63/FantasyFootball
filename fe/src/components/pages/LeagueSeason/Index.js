import React from 'react';
import { fromJS, List, Set, Map } from 'immutable';
import { Link } from 'react-router-dom';

import API from '../../../middleware/API';

import Spinner from '../../common/Spinner/Spinner';
import BackBtn from '../../common/Btn/BackBtn';
import Btn from '../../common/Btn/Btn';
import { Table, Thead, Tbody, Row, Col } from '../../common/Table/Index';

import Schedule from './Schedule';
import Standings from './Standings';
import TeamsInfo from './TeamsInfo';
import WeekResult from './WeekResult';

import classnames from 'classnames/bind';
import style from './Index.css';
const cx = classnames.bind(style);

class LeagueSeason extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      teams: List(),
      lid: this.props.match.params.l_id,
      ScheduleByLeagueId: Map(),
      standings: List(),
      pointdata: {},
      gameWeek: 0,
      record: [],
      weeklyData: List(),
      selectWeekResult: 1
    };
  }

  componentDidMount() {
    this.loadData();
  }

  selectedWeek = e =>{
    console.log("Select : " + e.target.value);
    this.setState({
      selectWeekResult: e.target.value
    });
  }

  loadData = () => {
    const { l_id } = this.props.match.params;
    const query = `
      {
        QueryLeagueTeams(league_id: "${l_id}") {
          _id
          name
          wins
          lose
          account{
            email
          }
          arrangement {
            position_qb_0 {
              ...playerMain
            }
            position_rb_0 {
              ...playerMain
            }
            position_wr_0 {
              ...playerMain
            }
            position_wr_1 {
              ...playerMain
            }
            position_te_0 {
              ...playerMain
            }
            position_k_0 {
              ...playerMain
            }
            position_p_0 {
              ...playerMain
            }
            position_defense_0 {
              ...playerMain
            }
            position_defense_1 {
              ...playerMain
            }
            position_defense_2 {
              ...playerMain
            }
            position_defense_3 {
              ...playerMain
            }
            position_defense_4 {
              ...playerMain
            }
          }
        }
        QueryScheduleByLeagueId(league_id: "${this.state.lid}" ) {
            week_no
            first_team {
              email
            }
            second_team {
              email
            }
        }
        QueryLeague(_id : "${this.state.lid}"){
          name
          gameWeek
          accounts {
            _id
            email
          }
        }
        ListTeam(league_id: "${this.state.lid}"){
          _id,
          name,
          account{
            _id
            email
          }
          wins
          lose
        }
        QueryGameRecordByLeagueId(league_id : "${this.state.lid}"){
          league_id
          week
          first_team {
            _id
            email
          }
          second_team {
            _id
            email
          }
          winner
          first_score
          second_score
        }
      }
      fragment playerMain on PlayerType {
        _id
        Name
        Position
      }
    `;
    this.setState({
      loading: true,
    });
    API.GraphQL(query).then(res => {
      const teams = fromJS(res.data.QueryLeagueTeams);
      const standings = fromJS(res.data.ListTeam);
      const GameRecordByLeagueId = res.data.QueryGameRecordByLeagueId;
      console.log("423GameRecordByLeagueId:",JSON.stringify( GameRecordByLeagueId ));
      
      console.log("gameweek:", res.data.QueryLeague);
      this.setState({
        loading: false,
        teams,
        gameWeek: res.data.QueryLeague['gameWeek'] || 1,
        standings,
      });

      if(this.state.gameWeek > 1){
        this.createWeeklyResult(GameRecordByLeagueId);
      }

      if (res.data.QueryScheduleByLeagueId.length > 0) {
        const ScheduleByLeagueId = fromJS(res.data.QueryScheduleByLeagueId);
        this.setState({
          ScheduleByLeagueId,
        });
      } else {
        this.createSchedule();
      }
    });
  };

  createSchedule = () => {
    const { l_id } = this.props.match.params;
    const variables = {
      inputsecheduleData: {
        league_id: l_id,
        weeks: 10,
      },
    };

    const mut = `
      mutation($inputsecheduleData: ScheduleInputType){
        SetSchedule(data: $inputsecheduleData){
          success
        }
      }
    `;

    API.GraphQL(mut, variables).then(res => {
      if (res && res.SetSchedule && res.SetSchedule.success) {
        const query = `
          QueryScheduleByLeagueId(league_id: "${this.state.lid}" ) {
            week_no
            first_team {
              email
            }
            second_team {
              email
            }
          }
          `;
        API.GraphQL(query).then(res => {
          const ScheduleByLeagueId = fromJS(res.data.QueryScheduleByLeagueId);
          this.setState({
            ScheduleByLeagueId,
          });
        });
      }
    });
  };

  run = () => {
    const mutation = `mutation{RunMatch(league_id: "${
      this.props.match.params.l_id
    }"){
      league_id
      week
    }}`;
    API.GraphQL(mutation).then(res => {
      this.loadData();
    });
  };

  createWeeklyResult = (gameRecord) => {
    let weeklyData = [];
    console.log("gameRecord:", gameRecord);
    console.log("came here outside gameweek", this.state.gameWeek);
    if(this.state.gameWeek > 1){
      console.log("came here inside gameweek");
      for(let i=0; i < this.state.gameWeek; i++){
        weeklyData[i] = [];
      }
      gameRecord.map( (d, i) => {
        weeklyData[d['week']].push( Object.assign({}, d) );
      });
      console.log("Weeklydata --->:", weeklyData);
    }
    const tmp = fromJS(weeklyData);
    this.setState({
      weeklyData: tmp
    });

    // console.log("printing here:",this.state.weeklyData);
  }

  render() {
    const { state, props } = this;
    const { loading, ScheduleByLeagueId, standings, gameWeek, teams, weeklyData, selectWeekResult } = state;
    // console.log("Weekly data42342342:", weeklyData);
    return (
      <div className={cx('root')}>
        <Link to={`/app/league/list`} style={{ display: 'inline-block' }}>
          <BackBtn type="secondary">Back to List</BackBtn>
        </Link>
        <Spinner show={loading} />

        {gameWeek < 11 ? (
          <Btn className={cx('run-btn')} onClick={this.run} type="secondary">
            Run match
          </Btn>
        ) : (
          <Btn className={cx('run-btn')} type="secondary" disabled>
            Season is over
          </Btn>
        )}
        
        <div className={cx('block')}>
          <Standings gameWeek={gameWeek} data={standings} />
          <div className={cx('schedule-wrap')}>
            <Schedule gameWeek={gameWeek} data={ScheduleByLeagueId} />
            {gameWeek > 1 ? (
            <WeekResult weeklyData={weeklyData} data={weeklyData.get(selectWeekResult)} selectedWeek={this.selectedWeek} />     
          ): (null)
            }
          </div>
        </div>
        <TeamsInfo data={teams} />
      </div>
    );
  }
}

export default LeagueSeason;
