export class Trip {
  constructor(data) {
    this.userId = data.userId;
    this.name = data.name;
    this.startDate = new Date(data.startDate);
    this.endDate = new Date(data.endDate);
    this.totalPlannedBudget = data.totalPlannedBudget || 0;
    this.totalActualSpent = 0; // Will be calculated
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}