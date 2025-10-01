type ContentSectionProps = {
  sectionTitle: string;
  sectionContent: string | Record<string, any>; // Can be either string or object
};

export const ContentSection = ({
  sectionTitle,
  sectionContent,
}: ContentSectionProps) => {
  return (
    <div style={{ marginBottom: "20px" }}>
      <h3
        style={{ fontWeight: "bold", fontSize: "18px", marginBottom: "10px" }}
      >
        {sectionTitle}
      </h3>
      <div style={{ marginBottom: "15px" }}>
        {typeof sectionContent === "string" ? (
          <p>{sectionContent}</p>
        ) : (
          Object.entries(sectionContent).map(([key, value], i) => (
            <div key={i} style={{ marginBottom: "10px" }}>
              {/* <strong>{key}:</strong> */}
              <div style={{ paddingLeft: "10px" }}>
                {Array.isArray(value) ? (
                  <ul>
                    {value.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <span>
                    {typeof value === "object"
                      ? JSON.stringify(value, null, 2)
                      : value}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
