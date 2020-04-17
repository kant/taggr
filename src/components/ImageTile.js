const { Component } = require("react");
const { html } = require("htm/react");

const Loading = () => html`<div className="dashboard__tile--loading"></div>`;

const styles = (imageUrl) => ({
  height: "100%",
  width: "100%",
  borderRadius: "4px",
  backgroundImage: `url(${imageUrl})`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center center",
  backgroundSize: "cover",
});

const ImageComponent = ({ imageUrl, onClick }) =>
  html` <div style=${styles(imageUrl)}></div>`;

class ImageTile extends Component {
  constructor(props) {
    super(props);

    this.state = { loading: true };
    this.bgImg = null;
  }

  componentDidMount() {
    if (!this.props.imageUrl) return;
    console.log("asdfs");

    this.bgImg = new Image();
    this.bgImg.src = this.props.imageUrl;

    this.bgImg.onload = () => {
      this.setState({ loading: false });
    };
  }

  render() {
    // this.state.loading;
    return html`
      ${this.state.loading
        ? html`<${Loading} />`
        : html`<${ImageComponent} imageUrl=${this.props.imageUrl} />`}
    `;
  }
}

// TODO: add proptypes

ImageTile.defaultProps = {
  imageUrl: "",
};

module.exports = ImageTile;
