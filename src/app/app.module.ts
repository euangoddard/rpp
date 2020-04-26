import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { NgxAliasModule } from 'ngx-alias';

import { AppRoutingModule } from 'src/app/app-routing.module';
import { AppComponent } from 'src/app/app.component';
import { HomeComponent } from 'src/app/components/home/home.component';
import { RecipeDetailComponent } from 'src/app/components/recipe-detail/recipe-detail.component';
import { RecipesListComponent } from 'src/app/components/recipes-list/recipes-list.component';
import { RecipeEffects } from 'src/app/effects/recipes';
import { RPP_REDUCERS } from 'src/app/reducers';
import { IngredientsPipe } from './pipes/ingredients.pipe';
import { MethodPipe } from './pipes/method.pipe';
import { SearchComponent } from './components/search/search.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    RecipesListComponent,
    RecipeDetailComponent,
    HomeComponent,
    MethodPipe,
    IngredientsPipe,
    SearchComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgxAliasModule,
    StoreModule.forRoot(RPP_REDUCERS, {
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true,
        strictStateSerializability: true,
        strictActionSerializability: true,
        strictActionWithinNgZone: true,
      },
    }),
    EffectsModule.forRoot([RecipeEffects]),
    NgxAliasModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
