export class Recipe {
  constructor(
    public id: string,
    public title: string,
    public imageUrl: string,
    public ingredients: string[],
    public instructions: string,
    public userId: string
  ){}
}
