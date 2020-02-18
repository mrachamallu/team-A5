//
//  SaleItemDetailView.swift
//  RaffleBay
//
//  Created by Meera Rachamallu on 2/6/20.
//  Copyright © 2020 Meera Rachamallu. All rights reserved.
//

import Foundation
import SwiftUI

struct SaleItemDetailView : View {

//    let saleItem: SaleItem
    var body: some View {
        VStack(){
            Spacer().frame(height: 100)
            VStack(alignment: .leading) {
                Image("bose")
                    .resizable()
                    .frame(maxWidth: 350, maxHeight: 200)
                
                Text("saleItem.name")
                    .h1()
                Text("Description")
                    .h2()
                
            }
            Spacer()
            VStack(alignment: .center){
                Text("Raffle Duration: 14 Days")
                    .fontWeight(.bold)
            }
            VStack(alignment: .leading){
                HStack(){
                    Text("Total List Price: ")
                        .clearButtonText()
                    Spacer()
                    Text("$50.00")
                        .clearButtonText()
                }
                HStack(){
                    Text("Tickets to Sell: ")
                        .clearButtonText()
                    Spacer()
                    Text("10")
                        .clearButtonText()
                }
            }.padding(20)
            Button(action:{
               
            }){
                Text("Add Listing")
                    .blueButtonText()
            }.buttonStyle(BigBlueButtonStyle())
        }.padding(40)
    }
}
