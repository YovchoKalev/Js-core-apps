function solve() {
    class TitleBar extends React.Component {
        render() {
            return (<header className="header">
                <div className="header-row">
                    <a className="button" onClick={this.showNavbar}>&#9776;</a>
                    <span className="title">{this.props.title}</span>
                </div>
                <div className="drawer">
                    <nav className="menu">
                        {this.props.links.map((name, index) =>
                            <a className="menu-link" href={name[0]} key={++index}>{name[1]}</a>
                        )};
                    </nav>
                </div>
            </header>)
        }

        showNavbar() {
            $('.drawer').toggle();
        }
    }
    let links = [
        ['/', 'Home'],
        ['about', 'About'],
        ['results', 'Results'],
        ['faq', 'FAQ']];
    // (links.map(a=>console.log(a[1])));

    ReactDOM.render(
        <TitleBar title="Title Bar Problem" links={links}/>,
        document.getElementById('head')
    );
}