// src/components/ui/table.tsx
import Typography from "./typography";

type TableProps = {
  headers: string[];
  data: {
    [key: string]: string | JSX.Element;
  }[];
};

export const Table = ({ headers, data }: TableProps) => {
  return (
    <table className="table w-full min-w-[420px] overflow-auto border border-y-grey/50 px-18">
      <thead>
        <tr>
          {headers.map((header, index) => (
            <Typography
              key={index}
              element="th"
              variant="body-sm"
              type="tertiary"
              className="pb-2 pt-4 text-left text-black md:pb-4 md:pt-6"
            >
              {header}
            </Typography>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {Object.entries(row).map(([key, value], cellIndex) => (
              <Typography
                key={cellIndex}
                element="td"
                variant="body-sm"
                type="tertiary"
                className="border-t border-grey/35 py-3 text-left text-black md:py-6"
              >
                {value}
              </Typography>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
