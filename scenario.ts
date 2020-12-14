export type Scenario = {
	description: string;
	verify: () => Promise<unknown>;
};
export const scenario = (x: Scenario) => x;
