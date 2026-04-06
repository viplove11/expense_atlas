export class Expense {
  constructor(data) {
    this.tripId = data.tripId;
    this.userId = data.userId;
    this.category = data.category;
    this.description = data.description;
    this.plannedAmount = data.plannedAmount || 0;
    this.actualAmount = data.actualAmount || 0;
    this.date = new Date(data.date);
    this.createdAt = new Date();
  }
}