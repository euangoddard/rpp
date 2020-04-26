import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/components/home/home.component';
import { RecipeDetailComponent } from 'src/app/components/recipe-detail/recipe-detail.component';
import { RecipesListComponent } from 'src/app/components/recipes-list/recipes-list.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'recipes',
    component: RecipesListComponent,
  },
  {
    path: 'recipes/:recipeId',
    component: RecipeDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
