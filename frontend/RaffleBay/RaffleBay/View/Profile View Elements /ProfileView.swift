//
//  ProfileView.swift
//  RaffleBay
//
//  Created by Pierson Marks on 2/17/20.
//  Copyright © 2020 Meera Rachamallu. All rights reserved.
//

import SwiftUI

let circleDiameter: CGFloat = 30


struct ProfileView: View {
    @EnvironmentObject var navigation: NavigationStack
    
    @ObservedObject var currUser = User()
    @ObservedObject var authenticationVM = AuthenticationViewModel()
    @State var sellingItems: [SellingOrBuyingItem] = []
    @State var buyingItems: [SellingOrBuyingItem] = []
    @State var items_bid_on = false
    var body: some View {
        VStack(){
            HStack(){
                Button(action: {
                     self.navigation.advance(
                        NavigationItem( view: AnyView(SidebarNavView())))
                }){
                     HamburgerIconView()
                }
                .foregroundColor(Color("LightGray"))
                Spacer()
                Button(action: {
                    self.navigation.unwind()
                }){
                   Text("Back")
                        .foregroundColor(Color.gray)
                        .fontWeight(.semibold)
                        .font(.custom("Poppins", size: 24))
                }
            }.padding()
                
            HStack(){
                Spacer()
                VStack(){
                    Image("profile")
                        .resizable()
                        .frame(width: 100, height: 100)
                        .clipShape(Circle())
                        .overlay(Circle().stroke(Color.white, lineWidth: 4))
                        .shadow(radius: 7)
                        
                    Text("\(currUser.firstName) \(currUser.lastName)")
                        .clearButtonText()
                    Text("Account Balance: $\(currUser.account_balance)")
                        .standardBoldText()
                }
                Spacer()
            }
            
            HStack(){
                Button(action: {
                    self.items_bid_on = true
                }){
                   Text("Items Bid On")
                       .standardBoldText()
                       .padding(8)
                }
                
                Button(action: {
                    self.items_bid_on = false
                }){
                    Text("Items Listed")
                        .standardBoldText()
                        .padding(8)
                }
            }
            HStack(){
                VStack(alignment: .center){
                    HStack(alignment: .bottom){
                        if items_bid_on {
                            Text("Items You've Bid On")
                            .standardBoldText()
                        } else {
                            Text("Items You've Listed")
                            .standardBoldText()
                        }
                        
                        Spacer()
                        Button(action:{
                            self.navigation.advance(NavigationItem( view: AnyView(UploadSaleItemView())))
                        }){
                            PlusButtonView()
                        }
                    }
                    .padding(8)
                    Rectangle()
                        .frame(height: 2.0, alignment: .bottom)
                        .foregroundColor(Color("LightGray"))
                        .offset(y:-10)
                    ScrollView {
                        if self.items_bid_on {
                            ForEach(buyingItems, id: \.id) { item in
                                ProfileBidItemView(buyingItem: item)
                            }

                        } else {
                            ForEach(sellingItems, id: \.id) { item in
                                ProfileSaleItemView(sellingItem: item)
                            }
                        }
                    }
                }
            }
        }
        .onAppear {
            if self.currUser.lastName == ""          {get_user_request(auth_token: self.authenticationVM.auth_token, user: self.currUser)
            }
            get_items_selling_and_bidding(auth_token: self.authenticationVM.auth_token) {
                response in
                self.sellingItems = response.0
                self.buyingItems = response.1
                print("selling count: \(self.sellingItems.count) ")
            }
            
        }
    }
}

struct ProfileView_Previews: PreviewProvider {
    static var previews: some View {
        ProfileView()
    }
}
