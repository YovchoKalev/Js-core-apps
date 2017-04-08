function solve() {
    let url = "https://baas.kinvey.com/appdata/kid_BJe588Szx/football-matches";
    let headers = {
        "Authorization": "Basic Z3Vlc3Q6Z3Vlc3Q=",
        "Content-Type": "application/json"
    };

    let myBets = [];
    class AppView extends React.Component {
        render() {
            return (<div className="wrapper">
                <HeaderView/>
                <ButtonView/>
                <ContentHolder/>
            </div>)
        }
    }
    class HeaderView extends React.Component {
        render() {
            return (<header className="header">
                <div>Dollar Football</div>
            </header>)
        }
    }
    class ButtonView extends React.Component {
        render() {
            return (<div className="button-holder">
                <button className="button" onClick={this.showBets}>My Bets</button>
                <button className="button" onClick={this.showMatches}>Matches</button>
            </div>)
        }

        showBets() {
            ReactDOM.render(<BetsView bets={myBets}/>,
                $('.content-holder')[0]);
        }

        showMatches() {
            $.ajax({
                method: 'GET',
                url: url,
                headers: headers,
                success: function (success) {
                    success = success.sort(function (elem1, elem2) {
                        let time1 = elem1.time.split(" ")[0];
                        let format1 = elem1.time.split(" ")[1];

                        let time2 = elem2.time.split(" ")[0];
                        let format2 = elem2.time.split(" ")[1];

                        let hour1 = Number(time1.split(":")[0]);
                        let minutes1 = Number(time1.split(":")[1]);

                        let hour2 = Number(time2.split(":")[0]);
                        let minutes2 = Number(time2.split(":")[1]);

                        let result = format1.localeCompare(format2);

                        if (result == 0) {
                            result = hour1 - hour2;
                        }

                        if (result == 0) {
                            result = minutes1 - minutes2;
                        }

                        return result;
                    });
                    ReactDOM.render(<MatchesView matches={success}/>,
                        $('.content-holder')[0]);
                },
                error: function (error) {
                    console.log(error);
                }
            });

        }
    }

    class BetsView extends React.Component {
        render() {
            return (<table>
                <tbody>
                <tr>
                    <th>Home Team</th>
                    <th>Away Team</th>
                    <th>Start</th>
                    <th>Bet On</th>
                    <th>Ratio</th>
                    <th>Value</th>
                    <th>Estimated Winnings</th>
                </tr>
                {this.props.bets.map(function (bet, index) {
                    return (<tr key={index}>
                        <td>{bet.homeTeam}</td>
                        <td>{bet.awayTeam}</td>
                        <td>{bet.time}</td>
                        <td>{bet.betType}</td>
                        <td>{bet.betRatio}</td>
                        <td>{bet.betValue}</td>
                        <td>{bet.estimatedWin}</td>
                    </tr>)
                })}
                </tbody>
            </table>);
        }
    }
    class MatchesView extends React.Component {
        constructor(props) {
            super(props);
            this.handleBet = this.handleBet.bind(this);
        }

        render() {
            let _self = this;

            return (<table>
                <tbody>
                <tr>
                    <th>Id</th>
                    <th>Home Team</th>
                    <th>Away Team</th>
                    <th>Start</th>
                    <th>Win</th>
                    <th>Draw</th>
                    <th>Lose</th>
                    <th>Bet</th>
                    <th>Bet On</th>
                    <th>Submit</th>
                </tr>
                {
                    this.props.matches.map(function (match, index) {
                        let hasBet = false;

                        myBets.forEach(function (myBet) {
                            if (myBet.id == match.id) {
                                hasBet = true;
                            }
                        });
                        return (<tr key={index}>
                            <td id={"match-" + match.id}>{match.id}</td>
                            <td id={"match-" + match.id + "-home"}>{match.home}</td>
                            <td id={"match-" + match.id + "-away"}>{match.away}</td>
                            <td id={"match-" + match.id + "-time"}>{match.time}</td>
                            <td id={"match-" + match.id + "-win"}>{match.ratio["1"]}</td>
                            <td id={"match-" + match.id + "-draw"}>{match.ratio["x"]}</td>
                            <td id={"match-" + match.id + "-lose"}>{match.ratio["2"]}</td>
                            <td id={"match-" + match.id + "-bet"}>
                                {
                                    hasBet == true
                                        ? <input type="number" min="1" max="1000000" disabled/>
                                        : <input type="number" min="1" max="1000000"/>
                                }
                            </td>
                            <td id={"match-" + match.id + "-bet-type"}>
                                {
                                    hasBet == true
                                        ? <select disabled></select>
                                        : <select>
                                        <option>Win</option>
                                        <option>Draw</option>
                                        <option>Lose</option>
                                    </select>

                                }
                            </td>
                            <td id={"match-" + match.id + "-button"}>
                                {
                                    hasBet == true
                                        ? <button disabled>Bet</button>
                                        : <button onClick={_self.handleBet}>Bet</button>
                                }
                            </td>

                        </tr>)
                    })
                }
                </tbody>
            </table>);
        }

        handleBet(ev) {
            let currentId = Number($(ev.target).parent().attr('id').replace('match-', '').replace('-button', ''));
            let value = Number($('#match-' + currentId + '-bet input').val());
            $('#match-' + currentId + '-bet input').val('');
            let betType = $('#match-' + currentId + '-bet-type select option:selected').text().toString().toLowerCase();

            let ratio = Number($('#match-' + currentId + '-' + betType).text());

            let homeTeam = $('#match-' + currentId + '-home').text();
            let awayTeam = $('#match-' + currentId + '-away').text();
            let time = $('#match-' + currentId + '-time').text();

            let bet = {
                id: currentId,
                homeTeam: homeTeam,
                awayTeam: awayTeam,
                time: time,
                betType: betType,
                betRatio: ratio,
                betValue: value,
                estimatedWin: (ratio * value).toFixed(2)
            };
            myBets.push(bet);
            let myMatches = this.props.matches;
            ReactDOM.render(<MatchesView matches={myMatches}/>,
                $(".content-holder")[0]);
        }

    }


    class ContentHolder extends React.Component {
        render() {
            return (<div className="content-holder">
            </div>)
        }
    }

    return {AppView, HeaderView, ButtonView, ContentHolder}
}

let components=solve();
ReactDOM.render(<components.AppView/>, document.getElementById('app')
);