import "../assets/NewFeed.css";

export default function NewFeed() {
  return (
    <div className="new-feed-wrapper">
      <div className="new-feed-header">
        <img
          alt="avatar"
          src="https://placehold.co/52x52/png"
          className="new-feed-avatar"
        />
        <div className="new-feed-user-name">Adu User</div>
        <button className="new-feed-view-button">View</button>
      </div>
      <div className="new-feed-main">
        <div className="new-feed-content">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin mollis
          sodales turpis, eget laoreet dui. Pellentesque ipsum mauris, tempor a
          facilisis a, accumsan gravida dui. Phasellus id viverra urna, ac
          bibendum nunc. In sagittis, est eu iaculis pellentesque, diam ex
          luctus augue, a viverra eros leo nec mi. Integer lacinia, lorem
          pulvinar mollis interdum, ante lorem vehicula lectus, ut pellentesque
          augue enim nec velit. Nulla molestie accumsan leo dignissim volutpat.
          Cras nec orci ut nunc tincidunt gravida ac eu dolor. Proin laoreet
          metus ac lectus mattis dapibus gravida in neque.
        </div>
      </div>
    </div>
  );
}
